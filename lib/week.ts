// lib/week.ts
export function weekStartSunday(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay(); // Sun=0
  const diff = day; // move back to Sunday
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0,10); // YYYY-MM-DD
}

export const dayOrder: Array<{key:'sun'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'; he:string}> = [
  { key:'sun', he:'ראשון' },
  { key:'mon', he:'שני' },
  { key:'tue', he:'שלישי' },
  { key:'wed', he:'רביעי' },
  { key:'thu', he:'חמישי' },
  { key:'fri', he:'שישי' },
  { key:'sat', he:'שבת' },
];
