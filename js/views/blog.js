/**
 * Blog: notas sobre camisetas puntuales que no llegan a tener ficha de
 * temporada propia — anécdotas de un partido, de un proveedor, de una
 * urgencia resuelta con lo que había en el kiosco del club.
 */

import { esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { BLOG_POSTS } from '../data/blog.js';
import { sectionHead } from '../components/ui.js';

export const blogPostHref = (post) => `#/blog/${encodeURIComponent(post.slug)}`;

function blogCardHTML(post) {
  return `<a class="blog-card reveal" href="${blogPostHref(post)}">
      <div class="blog-card__head">
        <span class="eyebrow">${esc(post.era)} · ${esc(post.tag)}</span>
        ${icon('arrowRight')}
      </div>
      <h3 class="blog-card__title">${esc(post.title)}</h3>
      <p class="blog-card__dek">${esc(post.dek)}</p>
    </a>`;
}

export function renderBlog() {
  const posts = BLOG_POSTS;
  return `<section class="section section--tight">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'Blog',
          title: 'Historias de camisetas',
        })}
        <p class="prose" style="margin:-6px 0 28px">Notas sobre piezas puntuales del archivo: camisetas de un solo
          partido, urgencias de vestuario, homenajes y rarezas que no entran en la línea de temporadas. Los hechos
          están chequeados contra <a href="https://enunabaldosa.com" target="_blank" rel="noopener">En una Baldosa</a>,
          un archivo de la comunidad al que cada nota linkea para quien quiera ver más.</p>
        <div class="blog-list">
          ${posts.map(blogCardHTML).join('')}
        </div>
      </div>
    </section>`;
}
