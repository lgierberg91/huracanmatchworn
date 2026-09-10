/**
 * Panel de administración: alta y baja de historiadores.
 * Llama a la Edge Function `admin-users`, que valida en el servidor que
 * quien llama sea admin (ver supabase/functions/admin-users).
 */

import { esc, qs } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { ADMIN_FN_URL } from '../config.js';
import { authHeaders, isAdmin, state as authState } from '../data/auth.js';

async function adminCall(body) {
  const response = await fetch(ADMIN_FN_URL, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `status ${response.status}`);
  return data;
}

export function renderAdmin() {
  if (!isAdmin()) {
    return `<div class="shell section">
        <a class="backlink" href="#/">${icon('arrowLeft')} Volver</a>
        <div style="margin-top:20px" class="empty">
          <h4>Sin acceso</h4>
          <p>El panel de administración es sólo para historiadores admin del archivo.</p>
        </div>
      </div>`;
  }

  return `<div class="shell section">
      <a class="backlink" href="#/">${icon('arrowLeft')} Volver</a>
      <div style="margin-top:20px;max-width:var(--shell-narrow)">
        <h1 style="font-family:var(--font-display);text-transform:uppercase;font-size:var(--fs-xl)">Historiadores</h1>
        <p class="stat__note" style="margin-top:8px">Quién puede aportar datos y fotos al archivo.</p>

        <div class="panel" style="margin-top:22px;overflow-x:auto">
          <table class="admin-table" id="admin-table">
            <thead><tr><th>Email</th><th>Nombre</th><th>Rol</th><th></th></tr></thead>
            <tbody><tr><td colspan="4">Cargando…</td></tr></tbody>
          </table>
        </div>

        <form class="admin-form" id="admin-create-form">
          <input class="field" type="email" id="ad-email" placeholder="Email" required>
          <input class="field" type="password" id="ad-password" placeholder="Contraseña (mín. 8 caracteres)" required minlength="8">
          <input class="field" id="ad-name" placeholder="Nombre (opcional)">
          <select class="field" id="ad-role">
            <option value="historian">Historiador</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" class="btn btn--primary btn--sm">${icon('plus')} Agregar</button>
          <span class="form-status" id="admin-status"></span>
        </form>
      </div>
    </div>`;
}

function loadList() {
  const tbody = qs('#admin-table tbody');
  if (!tbody) return;
  adminCall({ action: 'list' })
    .then((data) => {
      const rows = data.profiles || [];
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="4">Sin historiadores.</td></tr>';
        return;
      }
      const selfId = authState.session && authState.session.user.id;
      tbody.innerHTML = rows
        .map(
          (p) => `<tr>
            <td>${esc(p.email)}</td>
            <td>${esc(p.display_name || '—')}</td>
            <td><span class="role-tag${p.role === 'admin' ? ' role-tag--admin' : ''}">${esc(p.role)}</span></td>
            <td>${p.user_id === selfId ? '' : `<button type="button" class="link link--danger" data-remove="${esc(p.user_id)}">Quitar</button>`}</td>
          </tr>`
        )
        .join('');
      tbody.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!confirm('¿Quitar a este historiador? Va a perder acceso para aportar datos.')) return;
          adminCall({ action: 'remove', user_id: btn.dataset.remove })
            .then(loadList)
            .catch((error) => alert(`Error: ${error.message}`));
        });
      });
    })
    .catch((error) => {
      tbody.innerHTML = `<tr><td colspan="4">Error: ${esc(error.message)}</td></tr>`;
    });
}

export function mountAdmin() {
  if (!isAdmin()) return;
  loadList();

  const form = qs('#admin-create-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = qs('#admin-status');
    const email = qs('#ad-email').value.trim();
    const password = qs('#ad-password').value;
    const name = qs('#ad-name').value.trim();
    const role = qs('#ad-role').value;

    status.textContent = 'Creando…';
    adminCall({ action: 'create', email, password, display_name: name || null, role })
      .then(() => {
        status.textContent = '¡Listo!';
        form.reset();
        loadList();
      })
      .catch((error) => {
        status.textContent = `Error: ${error.message}`;
      });
  });
}
