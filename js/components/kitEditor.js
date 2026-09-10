/**
 * Editor de la camiseta oficial de un partido (jugador / arquero, frente / dorso,
 * marca, parche, publicidades). Sólo lo ven los historiadores logueados; escribe
 * en `match_kits` (una fila por match_id + role).
 */

import { esc, qs, qsa, toast } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { MAX_UPLOAD_BYTES } from '../config.js';
import { fetchKits, uploadKitPhoto, upsertKit } from '../data/api.js';
import { isMember } from '../data/auth.js';

const ROLES = [
  ['player', 'Jugador'],
  ['goalkeeper', 'Arquero'],
];
const SIDES = [
  ['front', 'Frente'],
  ['back', 'Dorso'],
];

export function kitEditorHTML() {
  if (!isMember()) return '';

  return `<details class="contrib" id="kit-editor-block">
      <summary class="contrib__head">${icon('shirt')} Cargar camiseta oficial</summary>
      <form class="contrib__form" id="kit-editor-form">
        <div class="field-row">
          <div class="chip-row" id="k-role" role="group" aria-label="Rol">
            ${ROLES.map(([v, l], i) => `<button type="button" class="chip${i === 0 ? ' is-on' : ''}" data-value="${v}">${l}</button>`).join('')}
          </div>
          <div class="chip-row" id="k-side" role="group" aria-label="Lado de la foto">
            ${SIDES.map(([v, l], i) => `<button type="button" class="chip${i === 0 ? ' is-on' : ''}" data-value="${v}">${l}</button>`).join('')}
          </div>
        </div>

        <div class="field-row">
          <button type="button" class="btn btn--ghost btn--sm" id="k-photo-btn">${icon('camera')} Elegir foto</button>
          <input type="file" id="k-photo" accept="image/*" hidden>
          <span class="form-status" id="k-photo-name"></span>
        </div>

        <input class="field" type="text" id="k-brand" placeholder="Marca: ej. Adidas, Topper, Kappa…">

        <div class="field-row">
          <div class="chip-row" id="k-patch-has" role="group" aria-label="Parche">
            <button type="button" class="chip is-on" data-value="sin">Sin parche</button>
            <button type="button" class="chip" data-value="con">Con parche</button>
          </div>
        </div>
        <input class="field" type="text" id="k-patch-text" placeholder="Descripción del parche" hidden>

        <div class="chip-row" id="k-sponsors-tags"></div>
        <input class="field" type="text" id="k-sponsor-input" placeholder="Publicidad y Enter para agregarla">

        <div class="field-row">
          <button type="submit" class="btn btn--primary btn--sm">${icon('check')} Guardar camiseta</button>
          <span class="form-status" id="k-status"></span>
        </div>
      </form>
    </details>`;
}

export function mountKitEditor(match, onChange) {
  if (!isMember()) return;

  const form = qs('#kit-editor-form');
  if (!form) return;

  const roleGroup = qs('#k-role');
  const sideGroup = qs('#k-side');
  const patchGroup = qs('#k-patch-has');
  const patchText = qs('#k-patch-text');
  const brandField = qs('#k-brand');
  const tagsBox = qs('#k-sponsors-tags');
  const sponsorInput = qs('#k-sponsor-input');
  const photoBtn = qs('#k-photo-btn');
  const photoInput = qs('#k-photo');
  const photoName = qs('#k-photo-name');
  const status = qs('#k-status');

  const setStatus = (text, kind = '') => {
    if (!status) return;
    status.textContent = text;
    status.className = `form-status${kind ? ` is-${kind}` : ''}`;
  };

  let byRole = new Map();
  let sponsors = [];
  let pickedFile = null;

  const activeValue = (group) => qs('.chip.is-on', group).dataset.value;
  const setActive = (group, value) => {
    qsa('.chip', group).forEach((btn) => btn.classList.toggle('is-on', btn.dataset.value === value));
  };

  const paintTags = () => {
    tagsBox.innerHTML = sponsors
      .map(
        (s, i) =>
          `<span class="chip chip--static">${esc(s)} <button type="button" class="tag-x" data-i="${i}" aria-label="Quitar">${icon('close')}</button></span>`
      )
      .join('');
  };

  const fillForRole = (role) => {
    const kit = byRole.get(role);
    brandField.value = (kit && kit.brand) || '';
    setActive(patchGroup, kit && kit.patch ? 'con' : 'sin');
    patchText.hidden = !(kit && kit.patch);
    patchText.value = (kit && kit.patch) || '';
    sponsors = (kit && kit.sponsors) || [];
    paintTags();
    pickedFile = null;
    photoInput.value = '';
    photoName.textContent = '';
  };

  roleGroup.addEventListener('click', (event) => {
    const btn = event.target.closest('.chip');
    if (!btn) return;
    setActive(roleGroup, btn.dataset.value);
    fillForRole(btn.dataset.value);
  });

  sideGroup.addEventListener('click', (event) => {
    const btn = event.target.closest('.chip');
    if (!btn) return;
    setActive(sideGroup, btn.dataset.value);
  });

  patchGroup.addEventListener('click', (event) => {
    const btn = event.target.closest('.chip');
    if (!btn) return;
    setActive(patchGroup, btn.dataset.value);
    patchText.hidden = btn.dataset.value !== 'con';
    if (btn.dataset.value !== 'con') patchText.value = '';
  });

  sponsorInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const value = sponsorInput.value.trim();
    if (!value || sponsors.includes(value)) { sponsorInput.value = ''; return; }
    sponsors.push(value);
    sponsorInput.value = '';
    paintTags();
  });

  tagsBox.addEventListener('click', (event) => {
    const btn = event.target.closest('.tag-x');
    if (!btn) return;
    sponsors.splice(Number(btn.dataset.i), 1);
    paintTags();
  });

  photoBtn.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus('La imagen supera los 5 MB.', 'err');
      photoInput.value = '';
      return;
    }
    pickedFile = file;
    photoName.textContent = file.name;
  });

  fetchKits(match.id)
    .then((kits) => {
      byRole = new Map(kits.map((k) => [k.role, k]));
      fillForRole(activeValue(roleGroup));
    })
    .catch(() => { /* sin camisetas cargadas todavía: el formulario arranca vacío */ });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const role = activeValue(roleGroup);
    const side = activeValue(sideGroup);
    const patchOn = activeValue(patchGroup) === 'con';

    setStatus('Guardando…');
    try {
      const fields = {
        brand: brandField.value.trim() || null,
        patch: patchOn ? (patchText.value.trim() || null) : null,
        sponsors,
      };
      if (pickedFile) {
        const path = await uploadKitPhoto(match.id, role, side, pickedFile);
        fields[side === 'front' ? 'front_photo_path' : 'back_photo_path'] = path;
      }
      const saved = await upsertKit(match.id, role, fields);
      byRole.set(role, saved);
      pickedFile = null;
      photoInput.value = '';
      photoName.textContent = '';
      setStatus('¡Guardado!', 'ok');
      toast('Camiseta guardada.');
      onChange && onChange();
    } catch (error) {
      console.error(error);
      setStatus('No se pudo guardar.', 'err');
    }
  });
}
