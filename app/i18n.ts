// app/i18n.ts
export type Lang = 'he' | 'en';

export const STR: Record<Lang, { [key: string]: string }> = {
  he: {
    tutorials: 'הדרכות',
    empty: 'אין עדיין תוכן.',
  },
  en: {
    tutorials: 'Tutorials',
    empty: 'No content yet.',
  },
};
