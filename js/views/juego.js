/**
 * "¿Qué camiseta es?" — el minijuego.
 *
 * Se muestra una camiseta del archivo con el sponsor y el logo de la marca
 * tapados, y se responde en orden: marca → sponsor → cuántas temporadas se usó
 * ese modelo → cuáles. Cada acierto suma; rendirse muestra la respuesta.
 *
 * Los datos y las zonas a tapar están en js/data/quiz.js.
 */

import { esc, qs, qsa, on, observeReveals } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { num } from '../lib/format.js';
import { playableKits, fullyLoadedKits, buildRound, masksFor, matches, normalize } from '../data/quiz.js';
import { SEASON_KITS } from '../data/seasonKits.js';
import { shirtBounds, toPhotoSpace, renderedImageRect } from '../lib/shirtBounds.js';
import { statHTML } from '../components/ui.js';
import { jerseyHTML } from '../components/jersey.js';

/* ---------------- estado de la partida ---------------- */

const game = {
  pool: [],
  index: 0,
  round: null,
  step: 0,
  found: [],        // para las preguntas de varias respuestas
  score: 0,
  answered: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  revealed: false,
};

let maskObserver = null;
let maskToken = 0;
let painted = null;

/* ---------------- pintado ---------------- */

function photoHTML(kit) {
  // Se pinta primero sin las zonas tapadas y se agregan apenas se mide la
  // camiseta, para no mostrar recuadros en el lugar equivocado ni un instante.
  return `<figure class="quiz-photo is-measuring">
      <img src="${esc(kit.src)}" alt="Camiseta a adivinar">
    </figure>`;
}

/**
 * Ubica las zonas tapadas sobre la camiseta de esta foto.
 * Las zonas se definen en porcentaje de la prenda; acá se traducen a la imagen,
 * que en cada foto viene con un encuadre distinto.
 */
async function applyMasks(kit) {
  const token = ++maskToken;
  const first = qs('.quiz-photo img');
  if (!first) return;

  const [box] = await Promise.all([
    shirtBounds(kit.src),
    first.decode().catch(() => {}),
  ]);

  // El panel se repinta en cada paso, así que hay que volver a buscar el marco:
  // el que existía al empezar a medir puede haber quedado fuera de la pantalla.
  if (token !== maskToken) return;
  const figure = qs('.quiz-photo');
  const img = figure && figure.querySelector('img');
  if (!figure || !img) return;

  const place = () => {
    qsa('.quiz-mask', figure).forEach((m) => m.remove());
    const frame = figure.getBoundingClientRect();
    const rect = renderedImageRect(img);
    const left = rect.left - frame.left;
    const top = rect.top - frame.top;

    figure.insertAdjacentHTML(
      'beforeend',
      masksFor(kit.id)
        .map((m) => toPhotoSpace(m, box))
        .map((m) => {
          const x = left + (m.x / 100) * rect.width;
          const y = top + (m.y / 100) * rect.height;
          const w = (m.w / 100) * rect.width;
          const h = (m.h / 100) * rect.height;
          return `<span class="quiz-mask" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px"></span>`;
        })
        .join('')
    );
  };

  place();
  figure.classList.remove('is-measuring');

  // al cambiar el tamaño del marco, los recuadros se recolocan
  if (maskObserver) maskObserver.disconnect();
  if ('ResizeObserver' in window) {
    maskObserver = new ResizeObserver(place);
    maskObserver.observe(figure);
  }
}


function seasonGridHTML(step) {
  // se ofrecen todas las temporadas del archivo que tengan camiseta, más las correctas
  const years = [...new Set([...SEASON_KITS.map((k) => String(k.year)), ...step.targets])]
    .sort((a, b) => Number(a) - Number(b));
  return `<div class="quiz-seasons">
      ${years.map((y) => `<button type="button" class="quiz-season" data-season="${esc(y)}">${esc(y)}</button>`).join('')}
    </div>`;
}

function stepHTML(step, position, total) {
  const head = `<h2 class="quiz-q">
      <span class="quiz-q__n">${position}.</span> ${esc(step.title)}
      ${step.kind === 'multi' ? `<span class="quiz-q__count">(${game.found.length}/${step.targets.length} adivinados)</span>` : ''}
    </h2>`;

  if (step.kind === 'seasons') {
    return `${head}
      <p class="quiz-hint">Seleccioná ${step.targets.length} ${step.targets.length === 1 ? 'temporada' : 'temporadas'}</p>
      ${seasonGridHTML(step)}
      <div class="quiz-actions">
        <button type="button" class="btn btn--primary btn--sm" id="q-check">Verificar temporadas</button>
        <button type="button" class="btn btn--ghost btn--sm" id="q-give">Rendirse</button>
      </div>`;
  }

  const chips = step.kind === 'multi' && game.found.length
    ? `<div class="chip-row" style="margin-top:14px">${game.found.map((f) => `<span class="chip chip--red chip--static">${icon('check')} ${esc(f)}</span>`).join('')}</div>`
    : '';

  return `${head}
      <div class="quiz-input-row">
        <input class="quiz-input" id="q-input" type="${step.kind === 'number' ? 'number' : 'text'}"
          placeholder="${esc(step.placeholder)}" autocomplete="off" inputmode="${step.kind === 'number' ? 'numeric' : 'text'}">
        <button type="button" class="btn btn--primary btn--sm" id="q-check">
          ${step.kind === 'multi' ? 'Verificar' : 'Responder'}
        </button>
      </div>
      ${chips}
      <div class="quiz-actions">
        ${step.kind === 'multi' ? '<button type="button" class="btn btn--ghost btn--sm" id="q-skip">Pasar a la siguiente</button>' : ''}
        <button type="button" class="btn btn--ghost btn--sm" id="q-give">Rendirse</button>
      </div>`;
}

function panelHTML() {
  const { round, step } = game;
  const current = round.steps[step];

  if (!current) {
    return `<div class="quiz-done">
        <span class="eyebrow">Ronda terminada</span>
        <h2 class="quiz-q">${esc(round.kit.label)}</h2>
        <p class="lede">Acertaste ${game.correct} de ${game.answered} ${game.answered === 1 ? 'pregunta' : 'preguntas'} en esta camiseta.</p>
        <div class="quiz-actions">
          <button type="button" class="btn btn--primary" id="q-next">${icon('arrowRight')} Otra camiseta</button>
          <a class="btn btn--ghost" href="#/camiseta/${encodeURIComponent(round.kit.id)}">Ver su ficha</a>
        </div>
      </div>`;
  }

  return `${stepHTML(current, step + 1, round.steps.length)}
    <p class="quiz-feedback" id="q-feedback" role="status" aria-live="polite"></p>`;
}

function scoreboardHTML() {
  const pct = game.answered ? Math.round((game.correct / game.answered) * 100) : 0;
  return `${statHTML({ value: game.score, label: 'Puntos' })}
    ${statHTML({ value: `${game.correct}/${game.answered}`, label: 'Aciertos', size: 'clamp(1.4rem,3vw,2rem)' })}
    ${statHTML({ value: `${pct}%`, label: 'Efectividad', size: 'clamp(1.4rem,3vw,2rem)' })}
    ${statHTML({ value: game.streak, label: 'Racha', note: game.bestStreak ? `mejor: ${game.bestStreak}` : '' })}`;
}

function paint() {
  const panel = qs('#quiz-panel');
  const board = qs('#quiz-score');
  const photo = qs('#quiz-photo');
  if (!panel) return;
  panel.innerHTML = panelHTML();
  if (board) board.innerHTML = scoreboardHTML();
  // La foto sólo se rehace al cambiar de camiseta: si se repintara en cada paso
  // volvería a medirse y parpadearía el difuminado en cada respuesta.
  if (photo && painted !== game.round.kit.id) {
    painted = game.round.kit.id;
    photo.innerHTML = photoHTML(game.round.kit);
    applyMasks(game.round.kit);
  }
  const input = qs('#q-input');
  if (input) input.focus();
}

/* ---------------- lógica ---------------- */

function feedback(message, kind) {
  const el = qs('#q-feedback');
  if (!el) return;
  el.textContent = message;
  el.className = `quiz-feedback is-${kind}`;
}

function nextStep() {
  game.step += 1;
  game.found = [];
  game.revealed = false;
  paint();
}

function award(points) {
  game.score += points;
  game.correct += 1;
  game.streak += 1;
  game.bestStreak = Math.max(game.bestStreak, game.streak);
}

function fail() {
  game.streak = 0;
}

function submitText() {
  const step = game.round.steps[game.step];
  const input = qs('#q-input');
  const value = (input.value || '').trim();
  if (!value) return;

  if (step.kind === 'multi') {
    const hit = step.targets.find((t) => matches(value, t) && !game.found.includes(t));
    if (hit) {
      game.found.push(hit);
      if (game.found.length === step.targets.length) {
        game.answered += 1;
        award(15);
        feedback('¡Todos! +15', 'ok');
        setTimeout(nextStep, 900);
      } else {
        paint();
        feedback('¡Bien! Falta alguno más.', 'ok');
      }
    } else {
      input.value = '';
      feedback(game.found.some((f) => matches(value, f)) ? 'Ese ya lo dijiste.' : 'No es ese. Probá de nuevo.', 'err');
    }
    return;
  }

  game.answered += 1;
  if (step.accepts.some((a) => matches(value, a))) {
    award(10);
    feedback('¡Correcto! +10', 'ok');
    setTimeout(nextStep, 800);
  } else {
    fail();
    feedback(`No. Era ${step.reveal}.`, 'err');
    setTimeout(nextStep, 1600);
  }
}

function submitSeasons() {
  const step = game.round.steps[game.step];
  const picked = qsa('.quiz-season.is-on').map((b) => b.dataset.season);
  if (!picked.length) return;

  game.answered += 1;
  const target = [...step.targets].map(String).sort().join('|');
  const given = [...picked].sort().join('|');

  if (target === given) {
    award(20);
    feedback('¡Exacto! +20', 'ok');
  } else {
    fail();
    feedback(`No. ${step.targets.length === 1 ? 'Era' : 'Eran'} ${step.reveal}.`, 'err');
    qsa('.quiz-season').forEach((b) => {
      if (step.targets.map(String).includes(b.dataset.season)) b.classList.add('is-answer');
    });
  }
  setTimeout(nextStep, 1800);
}

function giveUp() {
  const step = game.round.steps[game.step];
  game.answered += 1;
  fail();
  feedback(`${step.targets && step.targets.length > 1 ? 'Eran' : 'Era'} ${step.reveal}.`, 'reveal');
  setTimeout(nextStep, 1900);
}

function loadRound(kitId) {
  game.round = buildRound(kitId);
  game.step = 0;
  game.found = [];
  paint();
}

function nextKit() {
  game.index = (game.index + 1) % game.pool.length;
  loadRound(game.pool[game.index].id);
}

/* ---------------- vista ---------------- */

export function renderJuego() {
  const pool = playableKits();
  const complete = fullyLoadedKits();

  if (!pool.length) {
    return `<section class="quiz-hero">
        <div class="shell">
          <span class="eyebrow eyebrow--dark">Minijuego</span>
          <h1>¿Qué camiseta es?</h1>
        </div>
      </section>
      <div class="shell section">
        <div class="empty">
          <span class="empty__icon">${jerseyHTML({ size: 56, showBalloon: false, label: '' })}</span>
          <h4>Todavía no hay camisetas para jugar</h4>
          <p>El juego necesita saber la marca, el sponsor y las temporadas de cada camiseta.
             Se cargan en <code>js/data/quiz.js</code>.</p>
        </div>
      </div>`;
  }

  return `<section class="quiz-hero">
      <div class="shell">
        <span class="eyebrow eyebrow--dark">Minijuego</span>
        <h1>¿Qué camiseta es?</h1>
        <p class="lede" style="color:var(--on-dark-2);margin-top:14px;max-width:52ch">
          La foto va con el sponsor y la marca tapados. Adiviná de qué camiseta se trata,
          dato por dato.
        </p>
      </div>
    </section>

    <div class="shell section">
      <div class="quiz-board" id="quiz-score"></div>

      <div class="quiz-layout">
        <div id="quiz-photo"></div>
        <div class="quiz-panel" id="quiz-panel"></div>
      </div>

      ${complete.length < pool.length
        ? `<p class="stat__note" style="margin-top:26px">
            ${num(complete.length)} de ${num(pool.length)} camisetas tienen las cuatro preguntas cargadas.
            Las demás juegan sólo con lo que se sabe — el sponsor y las temporadas se completan en
            <code>js/data/quiz.js</code>.
          </p>`
        : ''}
    </div>`;
}

export function mountJuego() {
  const pool = playableKits();
  if (!pool.length) return;

  game.pool = pool.slice().sort(() => Math.random() - 0.5);
  game.index = 0;
  game.score = 0;
  game.answered = 0;
  game.correct = 0;
  game.streak = 0;
  game.bestStreak = 0;
  painted = null;
  loadRound(game.pool[0].id);

  const panel = qs('#quiz-panel');

  on(panel, 'click', '#q-check', () => {
    const step = game.round.steps[game.step];
    if (!step) return;
    if (step.kind === 'seasons') submitSeasons();
    else submitText();
  });

  on(panel, 'click', '#q-give', giveUp);
  on(panel, 'click', '#q-skip', () => { game.answered += 1; fail(); nextStep(); });
  on(panel, 'click', '#q-next', nextKit);

  on(panel, 'click', '.quiz-season', (event, button) => {
    button.classList.toggle('is-on');
  });

  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const step = game.round.steps[game.step];
    if (!step || step.kind === 'seasons') return;
    event.preventDefault();
    submitText();
  });

  observeReveals(document);
}

export { normalize };
