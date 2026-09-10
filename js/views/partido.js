/**
 * Ficha de partido: la pieza histórica en detalle.
 *
 * Jerarquía: qué camiseta es + quién la usó + contra quién + cuándo + qué pasó.
 */

import { esc, qs, on, toast, observeReveals } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { dateLong, venueLong, resultLong, resultClass, plural, dateMedium } from '../lib/format.js';
import { getMatch, matchesOfYear, clubEntry, record } from '../data/store.js';
import { crestHTML } from '../components/crest.js';
import { jerseyHTML } from '../components/jersey.js';
import { matchCardHTML, matchRowHTML, emptyStateHTML } from '../components/matchCard.js';
import { sectionHead, splitBarHTML } from '../components/ui.js';
import { contributeHTML, mountContribute } from '../components/contribute.js';
import { fetchPhotos, photoUrl } from '../data/api.js';
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
    <div class="matchup__side">
      ${crestHTML(match.club, 'hero', { onDark: true, eager: true })}
      <a class="matchup__name" href="#/rival/${esc(match.club.id)}">${esc(match.club.name)}</a>
    </div>`;
  const huracanSide = `
    <div class="matchup__side">
      ${crestHTML(HURACAN, 'hero', { onDark: true, eager: true })}
      <span class="matchup__name">Huracán</span>
    </div>`;

  const score = match.played
    ? (huracanFirst
        ? `${match.gf}<span>–</span>${match.ga}`
        : `${match.ga}<span>–</span>${match.gf}`)
    : 'A jugarse';

  const halftime =
    match.ht_gf != null && match.ht_ga != null
      ? `<div class="matchup__ht mono">Entretiempo ${huracanFirst ? `${match.ht_gf}–${match.ht_ga}` : `${match.ht_ga}–${match.ht_gf}`}</div>`
      : '';

  return `<section class="match-hero" style="${wash(match)}">
      <div class="shell match-hero__inner">
        <div class="match-hero__top">
          <a class="backlink backlink--onDark" href="#/temporada/${match.year}">${icon('arrowLeft')} Temporada ${match.year}</a>
          <div style="display:flex;gap:8px;align-items:center">
            <button type="button" class="fav-btn${isFavorite(match.id) ? ' is-on' : ''}" id="fav-btn"
              aria-pressed="${isFavorite(match.id)}" title="Guardar en favoritos">${icon('heart')}</button>
            <button type="button" class="btn btn--onDark btn--sm" id="share-btn">${icon('share')} Compartir</button>
          </div>
        </div>

        <div class="match-hero__comp" style="justify-content:center;margin-bottom:22px">
          <span class="chip chip--onDark">${esc(match.family.label)}</span>
          <span class="chip chip--onDark">${esc(match.edition)}</span>
          ${match.roundLabel ? `<span class="chip chip--onDark">${esc(match.roundLabel)}</span>` : ''}
        </div>

        <div class="matchup">
          ${huracanFirst ? huracanSide : rivalSide}
          <div>
            <div class="matchup__score mono${match.played ? '' : ' matchup__score--pending'}">${score}</div>
            ${halftime}
          </div>
          ${huracanFirst ? rivalSide : huracanSide}
        </div>

        <div class="match-hero__foot">
          <span class="chip chip--onDark">${icon('calendar')} ${esc(dateLong(match.date))}</span>
          <span class="chip chip--onDark">${icon('pin')} ${esc(venueLong(match.venue))}</span>
          ${match.result ? `<span class="res res--${resultClass(match.result)}">${esc(resultLong(match.result))}</span>` : ''}
        </div>
      </div>
    </section>`;
}

function kitSectionHTML(match) {
  const hasPhoto = Boolean(match.kitPhoto);
  const stage = hasPhoto
    ? `<img src="${esc(photoUrl(match.kitPhoto))}" alt="Camiseta usada ante ${esc(match.club.name)}">`
    : jerseyHTML({ size: 150, label: 'Camiseta sin identificar' });

  const caption = match.kitDescription
    ? `<div>
        <strong style="display:block;font-size:1.05rem">${esc(match.kitDescription)}</strong>
        ${match.patch_note ? `<span class="stat__note">${esc(match.patch_note)}</span>` : ''}
      </div>`
    : `<div>
        <strong style="display:block;font-size:1.05rem;color:var(--ink-3)">Camiseta sin identificar</strong>
        <span class="stat__note">Nadie cargó todavía cuál se usó esa tarde.</span>
      </div>`;

  const meta = [
    match.player && ['Jugador', match.player],
    match.kitType && ['Tipo', match.kitType],
  ].filter(Boolean);

  return `<section class="reveal">
      ${sectionHead({ eyebrow: 'La pieza', title: 'La camiseta' })}
      <div class="kit-stage">${stage}</div>
      <div class="kit-caption">
        ${caption}
        ${meta.length ? `<div class="chip-row">${meta.map(([k, v]) => `<span class="chip chip--static">${esc(k)}: ${esc(v)}</span>`).join('')}</div>` : ''}
      </div>
      <div id="photo-gallery"></div>
      <div style="margin-top:18px">${contributeHTML(match)}</div>
    </section>`;
}

function storySectionHTML(match) {
  const videoId = youtubeId(match.youtube_url);
  if (!match.story_text && !videoId && !match.youtube_url) return '';

  return `<section class="reveal" style="margin-top:clamp(30px,4vw,48px)">
      ${sectionHead({ eyebrow: 'El partido', title: 'Qué pasó ese día' })}
      ${match.story_text ? `<p class="story">${esc(match.story_text)}</p>` : ''}
      ${videoId
        ? `<div class="yt-embed" style="margin-top:20px">
            <iframe src="https://www.youtube-nocookie.com/embed/${esc(videoId)}" title="Video del partido"
              loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
          </div>`
        : match.youtube_url
          ? `<a class="btn btn--ghost btn--sm" style="margin-top:16px" href="${esc(match.youtube_url)}" target="_blank" rel="noopener">
              ${icon('play')} Ver en YouTube</a>`
          : ''}
    </section>`;
}

function dataPanelHTML(match) {
  const rows = [
    ['Fecha', esc(dateLong(match.date))],
    ['Temporada', `<a href="#/temporada/${match.year}">${match.year}</a>`],
    ['Competencia', esc(match.competition)],
    match.roundLabel && ['Instancia', esc(match.roundLabel)],
    ['Rival', `<a href="#/rival/${esc(match.club.id)}">${esc(match.club.name)}</a>`],
    ['Condición', esc(venueLong(match.venue))],
    match.played && ['Resultado', `${esc(resultLong(match.result))} ${match.gf}–${match.ga}`],
    match.ht_gf != null && ['Entretiempo', `${match.ht_gf}–${match.ht_ga}`],
    match.player && ['Jugador', esc(match.player)],
    match.scorersList.length && ['Goles', match.scorersList.map(esc).join(', ')],
  ].filter(Boolean);

  return `<div class="panel reveal">
      <div class="panel__title">Ficha</div>
      <div class="datalist">
        ${rows
          .map(
            ([key, value]) => `<div class="datalist__row">
              <span class="datalist__key">${esc(key)}</span>
              <span class="datalist__val">${value}</span>
            </div>`
          )
          .join('')}
      </div>
    </div>`;
}

function rivalPanelHTML(match) {
  const entry = clubEntry(match.club.id);
  if (!entry) return '';
  const balance = record(entry.matches);

  return `<div class="panel reveal" style="margin-top:clamp(16px,2vw,22px)">
      <div class="panel__title">Historial ante ${esc(clubShort(match.club))}</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        ${crestHTML(match.club, 'md')}
        <div>
          <strong style="display:block">${esc(match.club.name)}</strong>
          <span class="stat__note">${plural(entry.matches.length, 'partido', 'partidos')} en el archivo</span>
        </div>
      </div>
      ${splitBarHTML(balance)}
      <a class="btn btn--ghost btn--sm btn--block" style="margin-top:16px" href="#/rival/${esc(match.club.id)}">
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

  return `<div class="panel reveal" style="margin-top:clamp(16px,2vw,22px)">
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

  return `${heroHTML(match)}
    <div class="match-body">
      <div class="shell match-layout">
        <div>
          ${kitSectionHTML(match)}
          ${storySectionHTML(match)}
        </div>
        <aside>
          ${dataPanelHTML(match)}
          ${rivalPanelHTML(match)}
          ${neighboursHTML(match)}
        </aside>
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

