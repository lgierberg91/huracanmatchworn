/**
 * Ficha de partido: la pieza histórica en detalle.
 *
 * Jerarquía: qué camiseta es + quién la usó + contra quién + cuándo + qué pasó.
 */

import { esc, qs, qsa, on, toast, observeReveals } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { dateLong, venueLong, resultLong, resultClass, plural, dateMedium } from '../lib/format.js';
import { getMatch, matchesOfYear, clubEntry, record } from '../data/store.js';
import { crestHTML } from '../components/crest.js';
import { jerseyHTML } from '../components/jersey.js';
import { matchCardHTML, matchRowHTML, emptyStateHTML } from '../components/matchCard.js';
import { sectionHead, splitBarHTML } from '../components/ui.js';
import { contributeHTML, mountContribute } from '../components/contribute.js';
import { fetchPhotos, fetchKits, photoUrl } from '../data/api.js';
import { HURACAN, clubShort } from '../data/clubs.js';
import { isFavorite, toggleFavorite } from '../lib/storage.js';

/* ---------------- utilidades ---------------- */

function youtubeId(url) {
  if (!url) return null;
  const m = String(url).match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

const wash = (match) => {
  const key = match.result === 'W' ? 'win' : match.result === 'D' ? 'draw' : match.result === 'L' ? 'loss' : null;
  return key ? `--hero-wash: color-mix(in srgb, var(--${key}) 26%, transparent);` : '';
};

/* ---------------- bloques ---------------- */

function heroHTML(match) {
  const huracanFirst = match.venue !== 'A';
  const rivalSide = `
    <a class="mini-vs__side" href="#/rival/${esc(match.club.id)}">
      ${crestHTML(match.club, 'sm', { onDark: true, eager: true })}
      <span>${esc(clubShort(match.club))}</span>
    </a>`;
  const huracanSide = `
    <span class="mini-vs__side mini-vs__side--self">
      ${crestHTML(HURACAN, 'sm', { onDark: true, eager: true })}
      <span>Huracán</span>
    </span>`;

  const score = match.played
    ? (huracanFirst ? `${match.gf}–${match.ga}` : `${match.ga}–${match.gf}`)
    : '—';

  return `<section class="match-strip" style="${wash(match)}">
      <div class="shell match-strip__inner">
        <div class="match-strip__top">
          <a class="backlink backlink--onDark" href="#/temporada/${match.year}">${icon('arrowLeft')} Temporada ${match.year}</a>
          <div style="display:flex;gap:8px;align-items:center">
            <button type="button" class="fav-btn${isFavorite(match.id) ? ' is-on' : ''}" id="fav-btn"
              aria-pressed="${isFavorite(match.id)}" title="Guardar en favoritos">${icon('heart')}</button>
            <button type="button" class="btn btn--onDark btn--sm" id="share-btn">${icon('share')} Compartir</button>
          </div>
        </div>

        <div class="mini-vs">
          ${huracanFirst ? huracanSide : rivalSide}
          <span class="mini-vs__score mono${match.played ? '' : ' mini-vs__score--pending'}">${score}</span>
          ${huracanFirst ? rivalSide : huracanSide}
          ${match.result ? `<span class="res res--${resultClass(match.result)} mini-vs__res">${esc(resultLong(match.result))}</span>` : ''}
        </div>

        <div class="mini-vs__meta">
          <span>${esc(dateLong(match.date))}</span>
          <span>·</span>
          <span>${esc(match.family.label)}${match.roundLabel ? ` · ${esc(match.roundLabel)}` : ''}</span>
          <span>·</span>
          <span>${esc(venueLong(match.venue))}</span>
        </div>
      </div>
    </section>`;
}

const KIT_ROLES = [
  ['player', 'Jugador'],
  ['goalkeeper', 'Arquero'],
];

/** Frente y dorso de una camiseta oficial (jugador o arquero). Sin datos: silueta genérica. */
function kitPairHTML(kit) {
  if (!kit || (!kit.front_photo_path && !kit.back_photo_path)) {
    return jerseyHTML({ size: 220, label: 'Camiseta sin identificar' });
  }
  const imgs = [
    kit.front_photo_path && `<img src="${esc(photoUrl(kit.front_photo_path))}" alt="Frente">`,
    kit.back_photo_path && `<img src="${esc(photoUrl(kit.back_photo_path))}" alt="Dorso">`,
  ].filter(Boolean);
  return `<div class="kit-hero__pair">${imgs.join('')}</div>`;
}

function kitCaptionHTML(description, sub) {
  return description
    ? `<h1 class="kit-title">${esc(description)}</h1>
       ${sub ? `<p class="kit-sub">${esc(sub)}</p>` : ''}`
    : `<h1 class="kit-title kit-title--muted">Camiseta sin identificar</h1>
       <p class="kit-sub">Nadie cargó todavía cuál se usó esa tarde.</p>`;
}

function kitSectionHTML(match) {
  const hasPhoto = Boolean(match.kitPhoto);
  const videoId = youtubeId(match.youtube_url);
  const placeholderStage = hasPhoto
    ? `<img src="${esc(photoUrl(match.kitPhoto))}" alt="Camiseta usada ante ${esc(match.club.name)}">`
    : jerseyHTML({ size: 220, label: 'Camiseta sin identificar' });

  const videoBadge =
    videoId || match.youtube_url
      ? `<a class="kit-hero__video" href="${esc(match.youtube_url)}" target="_blank" rel="noopener" title="Ver el partido en YouTube">
          ${icon('play')} Ver video
        </a>`
      : '';

  const meta = [
    match.kitType && ['Tipo', match.kitType],
    match.player && ['Jugador', match.player],
  ].filter(Boolean);

  return `<section class="reveal kit-section">
      <div class="kit-hero">
        <div class="kit-switch" id="kit-switch" hidden>
          ${KIT_ROLES.map(([role, label], i) => `<button type="button" class="kit-switch__btn${i === 0 ? ' is-on' : ''}" data-role="${role}">${label}</button>`).join('')}
        </div>
        <div class="kit-hero__stage" id="kit-stage">${placeholderStage}</div>
        ${videoBadge}
      </div>
      <div id="photo-gallery" class="kit-hero__filmstrip"></div>
      <div class="kit-caption">
        <div id="kit-caption">${kitCaptionHTML(match.kitDescription, match.patch_note)}</div>
        ${meta.length ? `<div class="chip-row">${meta.map(([k, v]) => `<span class="chip chip--static">${esc(k)}: ${esc(v)}</span>`).join('')}</div>` : ''}
      </div>
      <div style="margin-top:18px">${contributeHTML(match)}</div>
    </section>`;
}

function storySectionHTML(match) {
  if (!match.story_text) return '';
  return `<p class="story reveal">${esc(match.story_text)}</p>`;
}

function factsStripHTML(match) {
  const chips = [
    `${icon('calendar')}${esc(dateLong(match.date))}`,
    `${icon('pin')}${esc(venueLong(match.venue))}`,
    `<a href="#/temporada/${match.year}">Temporada ${match.year}</a>`,
    match.ht_gf != null && `Entretiempo ${match.ht_gf}–${match.ht_ga}`,
    match.scorersList.length && `Goles: ${match.scorersList.map(esc).join(', ')}`,
  ].filter(Boolean);

  return `<div class="facts-strip reveal">
      ${chips.map((html) => `<span class="chip chip--static">${html}</span>`).join('')}
    </div>`;
}

function rivalPanelHTML(match) {
  const entry = clubEntry(match.club.id);
  if (!entry) return '';
  const balance = record(entry.matches);

  return `<div class="panel panel--flat reveal">
      <div class="panel__title">Historial ante ${esc(clubShort(match.club))}</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        ${crestHTML(match.club, 'sm')}
        <div>
          <strong style="display:block;font-size:var(--fs-sm)">${esc(match.club.name)}</strong>
          <span class="stat__note">${plural(entry.matches.length, 'partido', 'partidos')} en el archivo</span>
        </div>
      </div>
      ${splitBarHTML(balance)}
      <a class="btn btn--ghost btn--sm btn--block" style="margin-top:14px" href="#/rival/${esc(match.club.id)}">
        Ver historial completo ${icon('arrowRight')}
      </a>
    </div>`;
}

function neighboursHTML(match) {
  const season = matchesOfYear(match.year).sort((a, b) => a.date.localeCompare(b.date));
  const index = season.findIndex((m) => m.id === match.id);
  const prev = index > 0 ? season[index - 1] : null;
  const next = index >= 0 && index < season.length - 1 ? season[index + 1] : null;
  if (!prev && !next) return '';

  return `<div class="panel panel--flat reveal">
      <div class="panel__title">En la temporada</div>
      ${prev ? matchRowHTML(prev) : ''}
      ${next ? matchRowHTML(next) : ''}
    </div>`;
}

function relatedHTML(match) {
  const entry = clubEntry(match.club.id);
  const others = entry
    ? entry.matches.filter((m) => m.id !== match.id).sort((a, b) => b.highlight - a.highlight).slice(0, 4)
    : [];
  if (!others.length) return '';

  return `<section class="section section--paper2">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'Otros cruces',
          title: `Huracán vs. ${clubShort(match.club)}`,
          link: { href: `#/rival/${match.club.id}`, text: 'Historial completo' },
        })}
        <div class="piece-grid">${others.map((m) => matchCardHTML(m)).join('')}</div>
      </div>
    </section>`;
}

/* ---------------- vista ---------------- */

export function renderPartido(ctx) {
  const match = getMatch(decodeURIComponent(ctx.params.get('id')));
  if (!match) {
    return `<div class="shell section">
        <a class="backlink" href="#/coleccion">${icon('arrowLeft')} La colección</a>
        <div style="margin-top:20px">
          ${emptyStateHTML({
            title: 'No encontramos ese partido',
            text: 'El enlace puede estar viejo o el partido todavía no está cargado.',
          })}
        </div>
      </div>`;
  }

  const secondary = [rivalPanelHTML(match), neighboursHTML(match)].filter(Boolean);

  return `${heroHTML(match)}
    <div class="match-body">
      <div class="shell match-layout">
        ${kitSectionHTML(match)}
        ${factsStripHTML(match)}
        ${storySectionHTML(match)}
        ${secondary.length ? `<div class="match-secondary">${secondary.join('')}</div>` : ''}
      </div>
    </div>
    ${relatedHTML(match)}
    <div class="lightbox" id="lightbox" hidden>
      <button type="button" class="lightbox__close" id="lightbox-close" aria-label="Cerrar">${icon('close')}</button>
      <img id="lightbox-img" alt="">
    </div>`;
}

export function mountPartido(ctx, rerender) {
  const match = getMatch(decodeURIComponent(ctx.params.get('id')));
  if (!match) return;

  /* favorito */
  const favBtn = qs('#fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const now = toggleFavorite(match.id);
      favBtn.classList.toggle('is-on', now);
      favBtn.setAttribute('aria-pressed', String(now));
      toast(now ? 'Guardado en favoritos.' : 'Quitado de favoritos.');
    });
  }

  /* compartir */
  const shareBtn = qs('#share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const url = location.href;
      const title = `Huracán vs ${match.club.name} · ${dateMedium(match.date)}`;
      try {
        if (navigator.share) await navigator.share({ title, url });
        else {
          await navigator.clipboard.writeText(url);
          toast('Enlace copiado.');
        }
      } catch {
        /* el usuario canceló */
      }
    });
  }

  /* camisetas oficiales: jugador / arquero, con frente y dorso */
  const kitStage = qs('#kit-stage');
  const kitSwitch = qs('#kit-switch');
  const kitCaption = qs('#kit-caption');
  if (kitStage) {
    fetchKits(match.id)
      .then((kits) => {
        const byRole = new Map(kits.map((k) => [k.role, k]));
        if (!byRole.size) return; // nada cargado todavía: se queda con el placeholder

        let activeRole = byRole.has('player') ? 'player' : [...byRole.keys()][0];

        const paint = () => {
          const kit = byRole.get(activeRole);
          kitStage.innerHTML = kitPairHTML(kit);
          if (kitCaption) kitCaption.innerHTML = kitCaptionHTML(kit && kit.description, match.patch_note);
        };

        if (byRole.size > 1) {
          kitSwitch.hidden = false;
          on(kitSwitch, 'click', '.kit-switch__btn', (event, btn) => {
            if (!byRole.has(btn.dataset.role) || btn.dataset.role === activeRole) return;
            activeRole = btn.dataset.role;
            qsa('.kit-switch__btn', kitSwitch).forEach((b) => b.classList.toggle('is-on', b === btn));
            paint();
          });
        }

        paint();
      })
      .catch(() => {
        /* sin camisetas oficiales cargadas: se queda con el placeholder */
      });
  }

  /* galería de fotos aportadas */
  const gallery = qs('#photo-gallery');
  if (gallery) {
    fetchPhotos(match.id)
      .then((photos) => {
        if (!photos.length) return;
        gallery.innerHTML = `<div class="gallery">
            ${photos
              .map(
                (p) => `<button type="button" class="gallery__thumb" data-full="${esc(photoUrl(p.storage_path))}">
                  <img src="${esc(photoUrl(p.storage_path))}" alt="${esc(p.caption || 'Foto del partido')}" loading="lazy" decoding="async">
                </button>`
              )
              .join('')}
          </div>
          <p class="stat__note" style="margin-top:10px">${plural(photos.length, 'foto aportada', 'fotos aportadas')} por hinchas.</p>`;
      })
      .catch(() => {
        /* sin fotos: la ficha ya muestra el estado vacío */
      });
  }

  /* lightbox */
  const lightbox = qs('#lightbox');
  const lightboxImg = qs('#lightbox-img');
  if (lightbox) {
    on(document, 'click', '.gallery__thumb', (event, button) => {
      lightboxImg.src = button.dataset.full;
      lightbox.hidden = false;
    });
    const close = () => { lightbox.hidden = true; lightboxImg.removeAttribute('src'); };
    qs('#lightbox-close').addEventListener('click', close);
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !lightbox.hidden) close(); });
  }

  mountContribute(match, rerender);
  observeReveals(document);
}

