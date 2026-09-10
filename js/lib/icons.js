/**
 * Set de íconos en línea (stroke 1.75, viewBox 24).
 * Se devuelven como string para poder componerlos dentro de plantillas.
 */

const P = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;

export const icons = {
  search: P('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
  close: P('<path d="M18 6 6 18M6 6l12 12"/>'),
  arrowRight: P('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowLeft: P('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
  chevronRight: P('<path d="m9 6 6 6-6 6"/>'),
  chevronDown: P('<path d="m6 9 6 6 6-6"/>'),
  star: P('<path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z"/>'),
  heart: P('<path d="M12 20s-7.2-4.4-9-9a5 5 0 0 1 9-3.2A5 5 0 0 1 21 11c-1.8 4.6-9 9-9 9z"/>'),
  share: P('<path d="M12 15V4M8.5 7.5 12 4l3.5 3.5"/><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
  sliders: P('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  home: P('<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'),
  grid: P('<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/>'),
  clock: P('<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6V12l3 1.8"/>'),
  chart: P('<path d="M4 20h16"/><rect x="5.5" y="11" width="3.4" height="6" rx="1"/><rect x="10.9" y="6.5" width="3.4" height="10.5" rx="1"/><rect x="16.3" y="14" width="3.4" height="3" rx="1"/>'),
  info: P('<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5"/><circle cx="12" cy="7.9" r=".7" fill="currentColor"/>'),
  camera: P('<path d="M4 8.5h3l1.6-2h6.8l1.6 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.3" r="3.2"/>'),
  play: P('<circle cx="12" cy="12" r="8.4"/><path d="M10.4 9.2 15 12l-4.6 2.8z" fill="currentColor" stroke="none"/>'),
  calendar: P('<rect x="3.6" y="5.2" width="16.8" height="15" rx="2"/><path d="M3.6 10h16.8M8.4 3.6v3.2M15.6 3.6v3.2"/>'),
  pin: P('<path d="M12 21s6.4-5.4 6.4-10.2A6.4 6.4 0 0 0 5.6 10.8C5.6 15.6 12 21 12 21z"/><circle cx="12" cy="10.6" r="2.3"/>'),
  sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2.2M12 19.2v2.2M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6"/>'),
  moon: P('<path d="M20 13.4A8 8 0 0 1 10.6 4a8.4 8.4 0 1 0 9.4 9.4z"/>'),
  check: P('<path d="m5 12.6 4.4 4.4L19 7.4"/>'),
  external: P('<path d="M14 4h6v6"/><path d="m20 4-8.4 8.4"/><path d="M18 14.4V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.6"/>'),
  link: P('<path d="M10.6 13.4a3.5 3.5 0 0 0 5 0l2.8-2.8a3.54 3.54 0 0 0-5-5L11.8 7.2"/><path d="M13.4 10.6a3.5 3.5 0 0 0-5 0l-2.8 2.8a3.54 3.54 0 0 0 5 5l1.6-1.6"/>'),
  plus: P('<path d="M12 5.5v13M5.5 12h13"/>'),
  trophy: P('<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H5a2.5 2.5 0 0 0 2.5 4M16.5 5.5H19a2.5 2.5 0 0 1-2.5 4"/><path d="M12 13.5V17M9 20h6"/>'),
  shirt: P('<path d="M8.5 3.5 4 5.8l1.8 3.6 2.3-1.4V20h7.8V8l2.3 1.4L20 5.8l-4.5-2.3s-1.3 2.2-3.5 2.2-3.5-2.2-3.5-2.2z"/>'),
  globe: P('<ellipse cx="12" cy="10.6" rx="6.6" ry="7.4"/><path d="M12 3.2v14.8M5.6 7.6c3.6 2.4 9.2 2.4 12.8 0M5.4 13c3.7 2.2 9.5 2.2 13.2 0"/><path d="M10.4 18h3.2v2.4h-3.2z"/>'),
  user: P('<circle cx="12" cy="8.4" r="3.6"/><path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0"/>'),
};

export const icon = (name) => icons[name] || '';
