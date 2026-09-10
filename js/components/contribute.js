/**
 * Formularios de aporte (modo colaborador).
 *
 * Se mantienen exactamente las mismas escrituras que la versión anterior:
 * la RPC `submit_kit_info` y la subida al bucket de fotos. Sólo pueden aportar
 * los historiadores del grupo cerrado, con sesión iniciada.
 */

import { esc, qs, toast } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { MAX_UPLOAD_BYTES, EXTENDED_CONTRIB } from '../config.js';
import { submitKitInfo, uploadPhoto } from '../data/api.js';
import { contributorName, saveContributorName } from '../lib/storage.js';
import { patchMatch } from '../data/store.js';
import { isMember } from '../data/auth.js';

export function contributeHTML(match) {
  if (!isMember()) {
    return `<div class="contrib">
        <p class="stat__note" style="margin:0">
          ¿Sabés qué camiseta se usó en este partido o tenés una foto?
          El archivo lo completa un grupo cerrado de historiadores hinchas de Huracán —
          iniciá sesión desde el ícono de arriba si formás parte.
        </p>
      </div>`;
  }

  return `<details class="contrib" id="contrib-block">
      <summary class="contrib__head">${icon('plus')} Aportar datos de este partido</summary>
      <form class="contrib__form" id="contrib-form">
        <input class="field" type="text" id="c-name" placeholder="Tu nombre (opcional)"
          value="${esc(contributorName())}" autocomplete="name">
        <input class="field" type="text" id="c-kit" placeholder="Camiseta: ej. titular 1990, rayas finas, cuello blanco"
          value="${esc(match.kit_description || '')}">
        <input class="field" type="text" id="c-patch" placeholder="Parche o variante (opcional)"
          value="${esc(match.patch_note || '')}">
        ${EXTENDED_CONTRIB
          ? `<input class="field" type="text" id="c-player" placeholder="Jugador que la usó"
               value="${esc(match.player || '')}">
             <input class="field" type="text" id="c-kit-type" placeholder="Tipo: titular, suplente, alternativa…"
               value="${esc(match.kit_type || '')}">`
          : ''}
        <textarea class="field" id="c-story" placeholder="Algo interesante de este partido…">${esc(match.story_text || '')}</textarea>
        <input class="field" type="url" id="c-yt" placeholder="Link de YouTube del partido"
          value="${esc(match.youtube_url || '')}">
        <div class="field-row">
          <button type="submit" class="btn btn--primary btn--sm">${icon('check')} Guardar aporte</button>
          <button type="button" class="btn btn--ghost btn--sm" id="c-photo-btn">${icon('camera')} Subir foto</button>
          <input type="file" id="c-photo" accept="image/*" hidden>
          <span class="form-status" id="c-status"></span>
        </div>
      </form>
    </details>`;
}

/**
 * @param {object} match
 * @param {() => void} onChange  se llama cuando el partido cambió y hay que repintar
 */
export function mountContribute(match, onChange) {
  if (!isMember()) return;

  const form = qs('#contrib-form');
  const status = qs('#c-status');
  if (!form) return;

  const setStatus = (text, kind = '') => {
    if (!status) return;
    status.textContent = text;
    status.className = `form-status${kind ? ` is-${kind}` : ''}`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = qs('#c-name').value.trim();
    const kit = qs('#c-kit').value.trim();
    const patch = qs('#c-patch').value.trim();
    const story = qs('#c-story').value.trim();
    const youtube = qs('#c-yt').value.trim();

    setStatus('Guardando…');
    saveContributorName(name);

    const extra = {};
    if (EXTENDED_CONTRIB) {
      extra.player = qs('#c-player').value.trim() || null;
      extra.kit_type = qs('#c-kit-type').value.trim() || null;
    }

    try {
      await submitKitInfo({
        p_match_id: match.id,
        p_kit_description: kit || null,
        p_patch_note: patch || null,
        p_story_text: story || null,
        p_youtube_url: youtube || null,
        p_contributor_name: name || null,
        ...(EXTENDED_CONTRIB ? { p_player: extra.player, p_kit_type: extra.kit_type } : {}),
      });
      patchMatch(match.id, {
        kit_description: kit || null,
        patch_note: patch || null,
        story_text: story || null,
        youtube_url: youtube || null,
        ...extra,
      });
      setStatus('¡Gracias! Guardado.', 'ok');
      toast('Aporte guardado. Gracias por sumar al archivo.');
      onChange && onChange();
    } catch (error) {
      console.error(error);
      setStatus('No se pudo guardar. Probá de nuevo.', 'err');
    }
  });

  const photoBtn = qs('#c-photo-btn');
  const photoInput = qs('#c-photo');
  if (photoBtn && photoInput) {
    photoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', async () => {
      const file = photoInput.files[0];
      if (!file) return;
      if (file.size > MAX_UPLOAD_BYTES) {
        setStatus('La imagen supera los 5 MB.', 'err');
        photoInput.value = '';
        return;
      }
      setStatus('Subiendo foto…');
      try {
        await uploadPhoto(match.id, file, contributorName());
        photoInput.value = '';
        setStatus('¡Gracias! Foto subida.', 'ok');
        toast('Foto subida al archivo.');
        onChange && onChange();
      } catch (error) {
        console.error(error);
        setStatus('No se pudo subir la foto.', 'err');
      }
    });
  }
}
