/**
 * Fotos aportadas para una nota del blog.
 * Cualquiera puede ver las fotos ya subidas; sólo el grupo cerrado de
 * historiadores logueados puede aportar una nueva (misma lógica que
 * el resto del archivo: bucket + tabla gateadas por RLS `is_member`).
 */

import { esc, qs, toast } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { MAX_UPLOAD_BYTES } from '../config.js';
import { uploadBlogPhoto, photoUrl } from '../data/api.js';
import { contributorName } from '../lib/storage.js';
import { isMember } from '../data/auth.js';

function galleryHTML(photos) {
  if (!photos.length) return '';
  return `<div class="gallery" id="blog-gallery">
      ${photos
        .map(
          (p) => `<button type="button" class="gallery__thumb" data-full="${esc(photoUrl(p.storage_path))}">
            <img src="${esc(photoUrl(p.storage_path))}" alt="${esc(p.caption || 'Foto de la nota')}" loading="lazy" decoding="async">
          </button>`
        )
        .join('')}
    </div>`;
}

function uploaderHTML() {
  if (!isMember()) return '';
  return `<div class="field-row" style="margin-top:14px">
      <button type="button" class="btn btn--ghost btn--sm" id="bp-photo-btn">${icon('camera')} Subir foto</button>
      <input type="file" id="bp-photo" accept="image/*" hidden>
      <span class="form-status" id="bp-status"></span>
    </div>`;
}

export function blogPhotosHTML(photos) {
  return `<div class="blog-photos">
      ${galleryHTML(photos)}
      ${uploaderHTML()}
      <div class="lightbox" id="lightbox" hidden>
        <button type="button" class="lightbox__close" id="lightbox-close" aria-label="Cerrar">${icon('close')}</button>
        <img id="lightbox-img" alt="">
      </div>
    </div>`;
}

/**
 * @param {string} slug
 * @param {() => void} onChange  se llama cuando se subió una foto nueva
 */
export function mountBlogPhotos(slug, onChange) {
  const lightbox = qs('#lightbox');
  const lightboxImg = qs('#lightbox-img');
  if (lightbox) {
    qs('#blog-gallery')?.addEventListener('click', (event) => {
      const button = event.target.closest('.gallery__thumb');
      if (!button) return;
      lightboxImg.src = button.dataset.full;
      lightbox.hidden = false;
    });
    const close = () => { lightbox.hidden = true; lightboxImg.removeAttribute('src'); };
    qs('#lightbox-close')?.addEventListener('click', close);
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !lightbox.hidden) close(); });
  }

  if (!isMember()) return;

  const status = qs('#bp-status');
  const setStatus = (text, kind = '') => {
    if (!status) return;
    status.textContent = text;
    status.className = `form-status${kind ? ` is-${kind}` : ''}`;
  };

  const photoBtn = qs('#bp-photo-btn');
  const photoInput = qs('#bp-photo');
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
        await uploadBlogPhoto(slug, file, contributorName());
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
