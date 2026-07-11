export interface HudRefs {
  scoreEl: HTMLElement;
  linesEl: HTMLElement;
  levelEl: HTMLElement;
}

export function updateHUD(refs: HudRefs, score: number, lines: number, level: number): void {
  refs.scoreEl.textContent = score.toLocaleString();
  refs.linesEl.textContent = String(lines);
  refs.levelEl.textContent = String(level);
}
