/**
 * Recorte automático del fondo de una foto de producto (camiseta sobre fondo
 * liso). Rellena por inundación desde los bordes de la imagen: cualquier
 * píxel conectado al borde y parecido en color al fondo se vuelve transparente.
 * Como el diseño de la camiseta (letras, escudo) está rodeado de tela y no
 * toca el borde, queda intacto aunque comparta tonos claros con el fondo.
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

export async function cutoutBackground(src, { tolerance = 32 } = {}) {
  if (cache.has(src)) return cache.get(src);

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

    let br = 0, bg = 0, bb = 0, n = 0;
    for (let x = 0; x < width; x++) {
      for (const y of [0, height - 1]) {
        const i = (y * width + x) * 4;
        br += data[i]; bg += data[i + 1]; bb += data[i + 2]; n++;
      }
    }
    br /= n; bg /= n; bb /= n;

    const visited = new Uint8Array(width * height);
    const stack = [];
    const tol2 = tolerance * tolerance;

    const visit = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const idx = y * width + x;
      if (visited[idx]) return;
      visited[idx] = 1;
      const i = idx * 4;
      const dr = data[i] - br, dg = data[i + 1] - bg, db = data[i + 2] - bb;
      if (dr * dr + dg * dg + db * db <= tol2) {
        data[i + 3] = 0;
        stack.push(x, y);
      }
    };

    for (let x = 0; x < width; x++) { visit(x, 0); visit(x, height - 1); }
    for (let y = 0; y < height; y++) { visit(0, y); visit(width - 1, y); }

    while (stack.length) {
      const y = stack.pop();
      const x = stack.pop();
      visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  });

  cache.set(src, promise);
  return promise;
}
