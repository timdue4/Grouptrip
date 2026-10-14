const fmt = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(key: string): string {
  return fmt.format(new Date(`${key}T00:00:00Z`));
}

export function formatRange(start: string, end: string): string {
  return `${formatDate(start)} bis ${formatDate(end)}`;
}

export function dayCount(start: string, end: string): number {
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
}