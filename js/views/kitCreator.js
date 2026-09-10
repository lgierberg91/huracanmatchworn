/**
 * Kit Creator: el vestidor.
 *
 * Combina la foto de un jugador con la de una camiseta. Estaba metido dentro
 * del hero de la home; acá pasa a tener sección propia, que es donde se puede
 * disfrutar sin competirle el lugar a la colección.
 *
 * El componente y su registro de fotos son los de js/components/dressup.js;
 * esta vista sólo le da marco.
 */

import { dressUpHTML, mountDressUp } from '../components/dressup.js';
import { PLAYERS, JERSEYS } from '../data/dressup.js';
import { plural } from '../lib/format.js';
import { statHTML } from '../components/ui.js';

export function renderKitCreator() {
  return `<section class="creator-hero">
      <div class="shell">
        <span class="eyebrow eyebrow--dark">El vestidor</span>
        <h1>Kit Creator</h1>
        <p class="lede" style="color:var(--on-dark-2);margin-top:16px;max-width:52ch">
          Elegí un jugador y probale las camisetas del archivo. Las flechas cambian
          la cara y la prenda.
        </p>
        <div class="hero__counts">
          ${statHTML({ value: JERSEYS.length, label: 'Camisetas' })}
          ${statHTML({ value: PLAYERS.length, label: 'Jugadores' })}
        </div>
      </div>
    </section>

    <div class="shell section">
      <div class="creator-stage">
        ${dressUpHTML()}
      </div>
      <p class="stat__note" style="margin-top:26px;text-align:center">
        ${plural(JERSEYS.length, 'camiseta disponible', 'camisetas disponibles')} ·
        para sumar una, dejá la foto en <code>assets/camisetas/</code> y registrala en
        <code>js/data/dressup.js</code>.
      </p>
    </div>`;
}

export function mountKitCreator() {
  mountDressUp();
}
