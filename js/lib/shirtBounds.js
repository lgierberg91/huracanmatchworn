/**
 * Encuentra dónde está la camiseta dentro de la foto.
 *
 * Las fotos del archivo no están encuadradas igual: en algunas la prenda ocupa
 * todo el cuadro y en otras queda chica y centrada sobre fondo blanco. Por eso
 * las zonas a tapar del minijuego no se pueden definir sobre la foto — se
 * definen sobre la CAMISETA, y acá se traducen.
 *
 * El fondo de estas fotos es blanco o transparente, así que alcanza con buscar
 * los píxeles que no lo son.
 */

const cache = new Map();

/** Un píxel cuenta como fondo si es transparente o casi blanco. */
function isBackground(r, g, b, a) {
  if (a < 24) return true;
  return r > 236 && g > 236 && b > 236;
}

/**
 * @param {string} src ruta de la imagen
 * @returns {Promise<{x:number,y:number,w:number,h:number}>} caja en % de la imagen
 */
export function shirtBounds(src) {
  if (cache.has(src)) return cache.get(src);

  const promise = new Promise((resolve) => {
    const fallback = { x: 0, y: 0, w: 100, h: 100 };
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onerror = () => resolve(fallback);
    img.onload = () => {
      try {
        // se analiza en chico: alcanza de sobra y es instantáneo
        const size = 120;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let minX = size, minY = size, maxX = -1, maxY = -1;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            if (isBackground(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }

        if (maxX < 0 || maxX - minX < size * 0.15) return resolve(fallback);

        resolve({
          x: (minX / size) * 100,
          y: (minY / size) * 100,
          w: ((maxX - minX + 1) / size) * 100,
          h: ((maxY - minY + 1) / size) * 100,
        });
      } catch {
        // canvas contaminado (imagen de otro origen): se usa la foto entera
        resolve(fallback);
      }
    };

    img.src = src;
  });

  cache.set(src, promise);
  return promise;
}

/**
 * Traduce una zona definida sobre la camiseta a coordenadas de la foto.
 * @param {{x:number,y:number,w:number,h:number}} mask en % de la camiseta
 * @param {{x:number,y:number,w:number,h:number}} box  en % de la foto
 */
export const toPhotoSpace = (mask, box) => ({
  x: box.x + (mask.x / 100) * box.w,
  y: box.y + (mask.y / 100) * box.h,
  w: (mask.w / 100) * box.w,
  h: (mask.h / 100) * box.h,
});

/**
 * Rectángulo que la imagen ocupa realmente dentro de su elemento.
 *
 * Con `object-fit: contain` y fotos de proporciones distintas, la imagen no
 * llena el marco: queda centrada con franjas a los costados o arriba y abajo.
 * Las zonas tapadas tienen que apoyarse en ESE rectángulo, no en el marco.
 */
export function renderedImageRect(img) {
  const box = img.getBoundingClientRect();
  if (!img.naturalWidth || !img.naturalHeight) return box;

  const imageRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = box.width / box.height;

  const width = imageRatio > boxRatio ? box.width : box.height * imageRatio;
  const height = imageRatio > boxRatio ? box.width / imageRatio : box.height;

  return {
    left: box.left + (box.width - width) / 2,
    top: box.top + (box.height - height) / 2,
    width,
    height,
  };
}
