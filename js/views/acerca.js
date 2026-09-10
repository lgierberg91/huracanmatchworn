/**
 * Acerca de: qué es el proyecto, cómo se completa y de dónde salen los datos.
 */

import { icon } from '../lib/icons.js';
import { num } from '../lib/format.js';
import { globalStats } from '../data/store.js';
import { statHTML } from '../components/ui.js';

export function renderAcerca() {
  const stats = globalStats();

  return `<section class="section section--dark section--tight">
      <div class="shell">
        <span class="eyebrow eyebrow--dark">El proyecto</span>
        <h1 style="font-size:clamp(2.2rem,6vw,3.6rem);margin:14px 0 18px;color:var(--on-dark)">
          Un archivo abierto, hecho entre hinchas
        </h1>
        <p class="lede" style="color:var(--on-dark-2)">
          Huracán Matchworn es un intento de registrar la historia del Globo desde otro lugar:
          no una camiseta por temporada, sino la que se usó en cada partido, con sus variantes,
          sus parches y las fotos que aparezcan.
        </p>
        <div class="hero__counts">
          ${statHTML({ value: stats.total, label: 'Partidos cargados' })}
          ${statHTML({ value: stats.rivals, label: 'Rivales' })}
          ${statHTML({ value: stats.withKit, label: 'Camisetas identificadas' })}
        </div>
      </div>
    </section>

    <div class="shell section">
      <div class="prose">
        <h3>Cómo está armado</h3>
        <p>El archivo tiene ${num(stats.total)} partidos entre ${stats.firstYear} y ${stats.lastYear},
          cada uno con su fecha, rival, competencia, instancia, localía y resultado. Sobre esa base
          se apoya todo lo demás: la colección, la línea de tiempo, las estadísticas y el historial
          contra cada rival, que se calculan solos a partir de los datos.</p>

        <h3>Qué falta</h3>
        <p>Falta la parte más difícil y la más linda: las camisetas. Hoy hay
          ${num(stats.withKit)} identificadas sobre ${num(stats.total)} partidos.
          Cualquiera puede sumar la descripción de una camiseta, un parche, una foto,
          un video o una historia del partido — sin cuenta ni registro.</p>

        <h3>Cómo colaborar</h3>
        <ul>
          <li>Entrá a la ficha del partido que quieras completar.</li>
          <li>Agregá <code>?edit</code> al final de la dirección para abrir el modo colaborador.</li>
          <li>Cargá lo que sepas: la camiseta, el parche, una foto, el video o la historia.</li>
        </ul>

        <h3>De dónde salen los datos</h3>
        <p>La base de resultados se armó a partir de <a href="https://www.worldfootball.net" target="_blank" rel="noopener">worldfootball.net</a>
          y se corrige a mano cuando aparece un error. Los escudos de los clubes fueron aportados
          para este proyecto; no se descargan automáticamente de ningún lado. Cuando un club no tiene
          escudo disponible se muestra un monograma en su lugar.</p>

        <h3>Aviso</h3>
        <p>Proyecto de hinchas, sin fines de lucro y sin afiliación oficial con el
          Club Atlético Huracán. Los escudos y marcas pertenecen a sus respectivos clubes.</p>

        <div style="margin-top:34px;display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn btn--primary" href="#/coleccion">${icon('grid')} Ir a la colección</a>
          <a class="btn btn--ghost" href="#/estadisticas">${icon('chart')} Ver estadísticas</a>
        </div>
      </div>
    </div>`;
}

