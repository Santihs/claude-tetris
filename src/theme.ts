const THEME_KEY = 'tetris-theme';

export interface ThemeRefs {
  themeToggleBtn: HTMLElement;
  themeIcon: HTMLElement;
}

export function applyTheme(theme: 'light' | 'dark', refs: ThemeRefs, onApplied: (gridLineColor: string) => void): void {
  document.body.dataset.theme = theme;
  refs.themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  refs.themeToggleBtn.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  const gridLineColor = getComputedStyle(document.body).getPropertyValue('--grid-line').trim();
  onApplied(gridLineColor);
}

export function initTheme(refs: ThemeRefs, onApplied: (gridLineColor: string) => void): void {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === 'light' ? 'light' : 'dark', refs, onApplied);
}

export function toggleTheme(refs: ThemeRefs, onApplied: (gridLineColor: string) => void): void {
  const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next as 'light' | 'dark', refs, onApplied);
}
