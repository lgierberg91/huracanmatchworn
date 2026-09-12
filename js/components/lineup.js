/**
 * La formación del partido: los once sobre la cancha, el banco al costado, los
 * cambios de Huracán abajo y una nota sobre la camiseta de ese día.
 *
 * Se ve siempre, cargada o no: vacía muestra los puestos con "Nombre", que es la
 * invitación a completarla. El botón Editar abre los campos en el lugar.
 *
 * IMPORTANTE PARA QUIEN LO TOQUE
 * El componente pinta sólo sus propias zonas (#lineup-pitch, #lineup-bench,
 * #lineup-subs, #lineup-tools, #kit-note). La camiseta que va en la columna
 * izquierda NO es suya: la arma y la repinta js/views/partido.js, que la va
 * cambiando según haya foto oficial, de arquero o aportada. Si este componente
 * repintara la grilla entera se llevaría puesto ese DOM y las referencias que
 * mountPartido se guardó.
 *
 * Los datos y su limitación (viven en el navegador, no en la base) están en
 * js/data/lineups.js.
 */

import { esc, qs, qsa, on } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import {
  FORMATIONS,
  DEFAULT_FORMATION,
  slotsFor,
  slotWidth,
  emptyLineup,
  readLineup,
  saveLineup,
  clearLineup,
  hasContent,
  isSeeded,
} from '../data/lineups.js';

const PLACEHOLDER = 'Nombre';

let state = null; // { matchId, lineup, editing }

/* ---------------- pintado ---------------- */

/**
 * En la cancha entra el apellido, no el nombre completo: "Hernán Galíndez" se
 * pinta "Galíndez". Los puestos están a pocos píxeles unos de otros y un nombre
 * entero se le monta encima al de al lado. El nombre completo queda en el
 * `title`, para quien pase el mouse.
 *
 * Se saca el nombre de pila y se deja el resto, así los apellidos compuestos
 * ("Fernández Cedrés") sobreviven enteros; sólo si aun así queda muy largo se
 * recorta a la última palabra.
 */
function shortName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || '';
  const rest = parts.slice(1).join(' ');
  return rest.length > 18 ? parts[parts.length - 1] : rest;
}

/**
 * Los once como lista, para los partidos de los que ESPN publica quiénes
 * jugaron pero no el dibujo — de 2014 para atrás, casi todos. Antes que
 * inventarles una posición, se los muestra en el orden en que vienen, que es
 * del arquero al ataque.
 */
function elevenListHTML() {
  const { lineup, editing } = state;

  return `<div class="lineup__head">
      <p class="panel__title">Titulares</p>
      <span class="lineup__shape mono">sin esquema</span>
    </div>
    <ol class="bench__list bench__list--eleven">
      ${lineup.starters
        .map(
          (player, i) => `<li class="bench__row">
            ${editing
              ? `<input class="bench__num-input" type="text" inputmode="numeric" maxlength="2"
                    value="${esc(player.number ?? '')}" data-role="starter-number" data-i="${i}"
                    aria-label="Número del titular ${i + 1}">
                 <input class="bench__name-input" type="text" placeholder="${PLACEHOLDER}"
                    value="${esc(player.name || '')}" data-role="starter-name" data-i="${i}"
                    aria-label="Nombre del titular ${i + 1}">`
              : `<span class="bench__num">${esc(player.number ?? '')}</span>
                 <span class="bench__name${player.name ? '' : ' is-empty'}">${esc(player.name || PLACEHOLDER)}</span>`}
          </li>`
        )
        .join('')}
    </ol>
    <p class="stat__note" style="margin-top:10px">
      De este partido se sabe quiénes jugaron, pero no en qué esquema. Van en el
      orden de la ficha, del arquero al ataque. Si sabés cómo formó, elegí el
      dibujo al editar y se pinta la cancha.
    </p>`;
}

function pitchHTML() {
  const { lineup, editing } = state;
  if (!lineup.formation) return elevenListHTML();
  const slots = slotsFor(lineup.formation);

  return `<div class="lineup__head">
      <p class="panel__title">Formación titular</p>
      <span class="lineup__shape mono">${esc(lineup.formation)}</span>
    </div>
    <div class="pitch">
      <div class="pitch__lines" aria-hidden="true">
        <span class="pitch__box pitch__box--top"></span>
        <span class="pitch__box pitch__box--bottom"></span>
        <span class="pitch__half"></span>
        <span class="pitch__circle"></span>
      </div>
      ${slots
        .map((slot, i) => {
          const player = lineup.starters[i] || { number: slot.number, name: '' };
          const width = `calc(${slotWidth(slot.perLine).toFixed(2)}% - 4px)`;
          return `<div class="pitch__slot" style="left:${slot.x}%;top:${slot.y}%;width:${width}">
              ${editing
                ? `<input class="pitch__num-input" type="text" inputmode="numeric" maxlength="2"
                      value="${esc(player.number ?? '')}" data-role="starter-number" data-i="${i}"
                      aria-label="Número del puesto ${i + 1}">
                   <input class="pitch__name-input" type="text" placeholder="${PLACEHOLDER}"
                      value="${esc(player.name || '')}" data-role="starter-name" data-i="${i}"
                      aria-label="Nombre del puesto ${i + 1}">`
                : `<span class="pitch__num">${esc(player.number ?? '')}</span>
                   <span class="pitch__name${player.name ? '' : ' is-empty'}"${player.name ? ` title="${esc(player.name)}"` : ''}>${esc(player.name ? shortName(player.name) : PLACEHOLDER)}</span>`}
            </div>`;
        })
        .join('')}
    </div>`;
}

function benchHTML() {
  const { lineup, editing } = state;
  return `<p class="panel__title">Suplentes</p>
    <ol class="bench__list">
      ${lineup.bench
        .map(
          (player, i) => `<li class="bench__row">
            ${editing
              ? `<input class="bench__num-input" type="text" inputmode="numeric" maxlength="2"
                    value="${esc(player.number ?? '')}" data-role="bench-number" data-i="${i}"
                    aria-label="Número del suplente ${i + 1}">
                 <input class="bench__name-input" type="text" placeholder="${PLACEHOLDER}"
                    value="${esc(player.name || '')}" data-role="bench-name" data-i="${i}"
                    aria-label="Nombre del suplente ${i + 1}">`
              : `<span class="bench__num">${esc(player.number ?? '')}</span>
                 <span class="bench__name${player.name ? '' : ' is-empty'}">${esc(player.name || PLACEHOLDER)}</span>`}
          </li>`
        )
        .join('')}
    </ol>`;
}

function subsHTML() {
  const { lineup, editing } = state;
  const head = '<p class="panel__title">Cambios de Huracán</p>';

  if (!editing) {
    if (!lineup.subs.length) {
      return `${head}<p class="stat__note">Todavía no se cargaron los cambios de este partido.</p>`;
    }
    return `${head}
      <ul class="subs__list">
        ${lineup.subs
          .map(
            (sub) => `<li class="subs__row">
              <span class="subs__min mono">${esc(sub.minute ? `${sub.minute}'` : '—')}</span>
              <span class="subs__out">${esc(sub.out || '—')}</span>
              <span class="subs__arrow">${icon('arrowRight')}</span>
              <span class="subs__in">${esc(sub.in || '—')}</span>
            </li>`
          )
          .join('')}
      </ul>`;
  }

  return `${head}
    <div class="subs__edit">
      ${lineup.subs
        .map(
          (sub, i) => `<div class="subs__row subs__row--edit">
            <input type="text" inputmode="numeric" maxlength="3" class="subs__min-input" placeholder="min"
              value="${esc(sub.minute || '')}" data-role="sub-minute" data-i="${i}" aria-label="Minuto del cambio ${i + 1}">
            <input type="text" placeholder="Sale" value="${esc(sub.out || '')}"
              data-role="sub-out" data-i="${i}" aria-label="Quién sale en el cambio ${i + 1}">
            <input type="text" placeholder="Entra" value="${esc(sub.in || '')}"
              data-role="sub-in" data-i="${i}" aria-label="Quién entra en el cambio ${i + 1}">
            <button type="button" class="icon-btn" data-role="sub-remove" data-i="${i}"
              title="Quitar este cambio" aria-label="Quitar este cambio">${icon('close')}</button>
          </div>`
        )
        .join('')}
      <button type="button" class="btn btn--ghost btn--sm" data-role="sub-add">${icon('plus')} Sumar un cambio</button>
    </div>`;
}

function noteHTML() {
  const { lineup, editing } = state;
  const head = '<p class="panel__title">Notas de la camiseta</p>';
  if (editing) {
    return `${head}<textarea class="kit-note__input" rows="3" data-role="kit-note"
        placeholder="Si ese día la camiseta tuvo algo distinto — un parche, otra numeración, se usó la alternativa por choque de colores — anotalo acá.">${esc(lineup.kitNote || '')}</textarea>`;
  }
  return lineup.kitNote
    ? `${head}<p class="kit-note__text">${esc(lineup.kitNote)}</p>`
    : `${head}<p class="stat__note">Sin notas de la camiseta de este partido.</p>`;
}

function toolsHTML() {
  const { editing, lineup, matchId } = state;
  const seeded = isSeeded(matchId);
  const edited = !seeded && hasContent(readLineup(matchId));

  if (!editing) {
    return `<div class="lineup__tools">
        <button type="button" class="btn btn--ghost btn--sm" data-role="edit">Editar la formación</button>
        <span class="stat__note">${seeded
          ? 'Formación del archivo. Si la editás, tu versión queda guardada en este navegador.'
          : 'Lo que cargues queda guardado en este navegador.'}</span>
      </div>`;
  }

  return `<div class="lineup__tools">
      <label class="lineup__formation">
        <span class="filter-group__label">Formación</span>
        <select class="select" data-role="formation">
          ${lineup.formation ? '' : '<option value="" selected>Sin esquema</option>'}
          ${FORMATIONS.map(
            (f) => `<option value="${esc(f.id)}"${lineup.formation === f.id ? ' selected' : ''}>${esc(f.id)}</option>`
          ).join('')}
        </select>
      </label>
      <button type="button" class="btn btn--primary btn--sm" data-role="save">${icon('check')} Guardar</button>
      <button type="button" class="btn btn--ghost btn--sm" data-role="cancel">Cancelar</button>
      ${edited
        ? `<button type="button" class="btn btn--ghost btn--sm" data-role="reset">Descartar mis cambios</button>`
        : ''}
    </div>`;
}

/* ---------------- API ---------------- */

/**
 * El marco. `kitColumnHTML` es la camiseta, que arma la vista del partido:
 * acá sólo se le reserva la columna izquierda y se le cuelga la nota debajo.
 */
export function lineupHTML(kitColumnHTML) {
  return `<section class="lineup reveal" id="lineup">
      <div class="lineup__grid">
        <div class="lineup__kit">
          ${kitColumnHTML}
          <div class="kit-note" id="kit-note"></div>
        </div>
        <div class="lineup__pitch-col" id="lineup-pitch"></div>
        <div class="lineup__bench-col" id="lineup-bench"></div>
      </div>
      <div class="lineup__subs" id="lineup-subs"></div>
      <div id="lineup-tools"></div>
    </section>`;
}

export function mountLineup(match) {
  const root = qs('#lineup');
  if (!root) return;

  state = {
    matchId: match.id,
    lineup: readLineup(match.id) || emptyLineup(DEFAULT_FORMATION),
    editing: false,
  };

  const zones = {
    pitch: qs('#lineup-pitch', root),
    bench: qs('#lineup-bench', root),
    subs: qs('#lineup-subs', root),
    tools: qs('#lineup-tools', root),
    note: qs('#kit-note', root),
  };

  const paint = () => {
    zones.pitch.innerHTML = pitchHTML();
    zones.bench.innerHTML = benchHTML();
    zones.subs.innerHTML = subsHTML();
    zones.tools.innerHTML = toolsHTML();
    if (zones.note) zones.note.innerHTML = noteHTML();
    root.classList.toggle('is-editing', state.editing);
  };

  /** Levanta lo tipeado antes de repintar, para no perderlo. */
  const collect = () => {
    if (!state.editing) return;
    const { lineup } = state;
    const grab = (role, apply) =>
      qsa(`[data-role="${role}"]`, root).forEach((el) => apply(el, +el.dataset.i));

    grab('starter-number', (el, i) => { lineup.starters[i].number = el.value.trim(); });
    grab('starter-name', (el, i) => { lineup.starters[i].name = el.value.trim(); });
    grab('bench-number', (el, i) => { lineup.bench[i].number = el.value.trim(); });
    grab('bench-name', (el, i) => { lineup.bench[i].name = el.value.trim(); });
    grab('sub-minute', (el, i) => { lineup.subs[i].minute = el.value.trim(); });
    grab('sub-out', (el, i) => { lineup.subs[i].out = el.value.trim(); });
    grab('sub-in', (el, i) => { lineup.subs[i].in = el.value.trim(); });

    const note = qs('[data-role="kit-note"]', root);
    if (note) lineup.kitNote = note.value.trim();
  };

  on(root, 'click', '[data-role="edit"]', () => {
    state.editing = true;
    paint();
  });

  on(root, 'click', '[data-role="cancel"]', () => {
    state.editing = false;
    state.lineup = readLineup(match.id) || emptyLineup(DEFAULT_FORMATION);
    paint();
  });

  on(root, 'click', '[data-role="save"]', () => {
    collect();
    saveLineup(match.id, state.lineup);
    state.editing = false;
    paint();
  });

  /* Borra lo editado a mano. Si el partido trae formación cargada, vuelve a ésa. */
  on(root, 'click', '[data-role="reset"]', () => {
    clearLineup(match.id);
    state.lineup = readLineup(match.id) || emptyLineup(DEFAULT_FORMATION);
    state.editing = false;
    paint();
  });

  on(root, 'click', '[data-role="sub-add"]', () => {
    collect();
    state.lineup.subs.push({ minute: '', out: '', in: '' });
    paint();
  });

  on(root, 'click', '[data-role="sub-remove"]', (event, button) => {
    collect();
    state.lineup.subs.splice(+button.dataset.i, 1);
    paint();
  });

  /*
    Cambiar de dibujo conserva los nombres ya tipeados por posición: se pasa de
    4-3-3 a 4-4-2 sin volver a escribir los once.
  */
  root.addEventListener('change', (event) => {
    if (!event.target.matches('[data-role="formation"]')) return;
    collect();
    const names = state.lineup.starters.map((p) => p.name);
    const next = emptyLineup(event.target.value);
    next.starters.forEach((slot, i) => { slot.name = names[i] || ''; });
    next.bench = state.lineup.bench;
    next.subs = state.lineup.subs;
    next.kitNote = state.lineup.kitNote;
    state.lineup = next;
    paint();
  });

  paint();
  return () => { state = null; };
}
