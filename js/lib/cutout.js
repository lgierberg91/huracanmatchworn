/**
 * Recorte automático del fondo de una foto (camiseta de producto o retrato).
 * Inundación en cadena desde los bordes: cada píxel se compara con el vecino
 * que lo "descubrió" (no con un color de fondo fijo), así que tolera fondos
 * con degradé o textura leve además de los lisos. El diseño/rostro no toca
 * el borde de la imagen, así que queda intacto aunque comparta tonos con el fondo.
 *
 * No es una segmentación real: un fondo con mucho detalle (tribuna, multitud)
 * no se puede limpiar del todo con esta técnica; para esos casos conviene
 * partir de una foto con fondo más parejo.
 */

const cache = new Map();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}

export async function cutoutBackground(src, { tolerance = 30 } = {}) {
  const key = `${src}::${tolerance}`;
  if (cache.has(key)) return cache.get(key);

  const promise = loadImage(src).then((img) => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const tol2 = tolerance * tolerance;
    const stack = [];

    const clear = (x, y, i) => {
      visited[y * width + x] = 1;
      data[i + 3] = 0;
      stack.push(x, y, data[i], data[i + 1], data[i + 2]);
    };

    const tryVisit = (x, y, pr, pg, pb) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const idx = y * width + x;
      if (visited[idx]) return;
      const i = idx * 4;
      const dr = data[i] - pr, dg = data[i + 1] - pg, db = data[i + 2] - pb;
      if (dr * dr + dg * dg + db * db <= tol2) clear(x, y, i);
      else visited[idx] = 1;
    };

    for (let x = 0; x < width; x++) {
      clear(x, 0, (0 * width + x) * 4);
      clear(x, height - 1, ((height - 1) * width + x) * 4);
    }
    for (let y = 0; y < height; y++) {
      clear(0, y, (y * width + 0) * 4);
      clear(width - 1, y, (y * width + (width - 1)) * 4);
    }

    while (stack.length) {
      const pb = stack.pop(), pg = stack.pop(), pr = stack.pop(), y = stack.pop(), x = stack.pop();
      tryVisit(x + 1, y, pr, pg, pb);
      tryVisit(x - 1, y, pr, pg, pb);
      tryVisit(x, y + 1, pr, pg, pb);
      tryVisit(x, y - 1, pr, pg, pb);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  });

  cache.set(key, promise);
  return promise;
}
