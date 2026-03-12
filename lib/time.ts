/**
 * Formatea la fecha para mostrar en el countdown
 */
export function formatCountdown(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Calcula si los resultados deben ser revelados
 */
export function shouldRevealResults(revealAt: Date): boolean {
  return new Date() >= revealAt;
}

/**
 * Obtiene el tiempo restante en milisegundos
 */
export function getTimeRemaining(revealAt: Date): number {
  const diff = revealAt.getTime() - new Date().getTime();
  return diff > 0 ? diff : 0;
}
