/**
 * Ficha de una nota del blog.
 */

import { esc, qs } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { blogPostBySlug, blogPostsSorted } from '../data/blog.js';
import { emptyStateHTML } from '../components/matchCard.js';
import { blogPostHref } from './blog.js';
import { fetchBlogPhotos } from '../data/api.js';
import { blogPhotosHTML, mountBlogPhotos } from '../components/blogPhotos.js';

export function renderBlogPost(ctx) {
  const post = blogPostBySlug(ctx.params.get('id'));

  if (!post) {
    return `<div class="shell section">
        <a class="backlink" href="#/blog">${icon('arrowLeft')} El blog</a>
        <div style="margin-top:20px">
          ${emptyStateHTML({
            title: 'No encontramos esa nota',
            text: 'Puede que el enlace esté viejo. Probá volver al listado del blog.',
          })}
        </div>
      </div>`;
  }

  const others = blogPostsSorted().filter((p) => p.slug !== post.slug).slice(0, 4);

  return `<section class="section section--tight">
      <div class="shell">
        <a class="backlink" href="#/blog">${icon('arrowLeft')} El blog</a>
        <article class="blog-post" style="margin-top:20px">
          <div class="blog-post__body">
            <span class="eyebrow">${esc(post.era)} · ${esc(post.tag)}</span>
            <h1 style="margin:10px 0 20px">${esc(post.title)}</h1>
            <div class="prose">
              ${post.body.map((p) => `<p>${esc(p)}</p>`).join('')}
            </div>
          </div>
          <aside class="blog-post__media">
            <div id="blog-photos-slot"></div>
          </aside>
        </article>
        ${others.length
          ? `<div style="margin-top:40px">
              <h2 style="font-size:var(--fs-lg);margin-bottom:14px">Otras notas</h2>
              <div class="blog-list">
                ${others
                  .map(
                    (p) => `<a class="blog-card" href="${blogPostHref(p)}">
                      <div class="blog-card__head">
                        <span class="eyebrow">${esc(p.era)} · ${esc(p.tag)}</span>
                        ${icon('arrowRight')}
                      </div>
                      <h3 class="blog-card__title">${esc(p.title)}</h3>
                    </a>`
                  )
                  .join('')}
              </div>
            </div>`
          : ''}
      </div>
    </section>`;
}

export function mountBlogPost(ctx, rerender) {
  const post = blogPostBySlug(ctx.params.get('id'));
  if (!post) return;

  const slot = qs('#blog-photos-slot');
  if (!slot) return;

  fetchBlogPhotos(post.slug)
    .then((photos) => {
      slot.innerHTML = blogPhotosHTML(photos);
      mountBlogPhotos(post.slug, rerender);
    })
    .catch((error) => {
      console.error(error);
      slot.innerHTML = blogPhotosHTML([]);
      mountBlogPhotos(post.slug, rerender);
    });
}
