/**
 * Kit Creator: el vestidor.
 *
 * Estaba metido dentro del hero de la home; acá tiene sección propia, que es
 * donde se puede disfrutar sin competirle el lugar al archivo.
 *
 * Las combinaciones jugador + camiseta no se arman en vivo: son fotos ya
 * generadas con IA que viven en assets/hero y se registran en js/data/dressup.js.
 * El componente que las muestra es js/components/dressup.js; esta vista sólo le
 * da marco y cuenta lo que hay.
 */

import { dressUpHTML, mountDressUp } from '../components/dressup.js';
import { heroPhotoCount } from '../data/dressup.js';
import { plural } from '../lib/format.js';

export function renderKitCreator() {
  const photos = heroPhotoCount();

  return `<section class="creator-hero">
      <div class="shell">
        <span class="eyebrow eyebrow--dark">El vestidor</span>
        <h1>Kit Creator</h1>
      </div>
    </section>

    <div class="shell section">
      <div class="creator-layout">
        <div class="creator-stage">
          ${dressUpHTML()}
        </div>
        <p class="lede creator-layout__text">
          Elegí un histórico jugador de Huracán y probale las camisetas del archivo. Cada combinación es
          una imagen generada aparte: acá sólo se revela la que pediste.
        </p>
      </div>
      <p class="stat__note" style="margin-top:26px;text-align:center">
        ${plural(photos, 'combinación generada', 'combinaciones generadas')} ·
        para sumar una, dejá la imagen en <code>assets/hero/&lt;temporada&gt;/</code> y
        registrala en <code>js/data/dressup.js</code>.
      </p>
    </div>`;
}

export function mountKitCreator() {
  return mountDressUp();
}
