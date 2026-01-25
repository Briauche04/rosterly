// app/i18n.ts

export type Lang = 'he' | 'en';

export const STR: Record<Lang, Record<string, string>> = {
  he: {
    home_title: 'ברוכים הבאים לרוסטרלי!',
    home_subtitle: 'המערכת המושלמת לניהול משמרות בקלות וביעילות.',
    submit_card_title: 'הגשת משמרת',
    submit_card_description: 'סימון זמינות לשבוע הקרוב בצורה ברורה ומדויקת.',
    reminders_card_title: 'תזכורות',
    reminders_card_description: 'צפה בתזכורות שנשלחו לעובדים.',
    team_card_title: 'צוות',
    team_card_description: 'נהל את חברי הצוות שלך.',
    manager_card_title: 'איזור מנהלים',
    manager_card_description: 'גישה לכלי הניהול המתקדמים.',
    forum_card_title: 'פורום',
    forum_card_description: 'הצג והגב להודעות מהצוות.',
    tutorials_card_title: 'מדריכים',
    tutorials_card_description: 'למד כיצד להשתמש ברוסטרלי.',
  },
  en: {
    home_title: 'Welcome to Rosterly!',
    home_subtitle: 'The perfect platform for shift management.',
    submit_card_title: 'Submit Shift',
    submit_card_description: 'Mark your availability for the upcoming week.',
    reminders_card_title: 'Reminders',
    reminders_card_description: 'See reminders sent to staff.',
    team_card_title: 'Team',
    team_card_description: 'Manage your team members.',
    manager_card_title: 'Manager Area',
    manager_card_description: 'Access admin tools and dashboards.',
    forum_card_title: 'Forum',
    forum_card_description: 'View and reply to staff messages.',
    tutorials_card_title: 'Tutorials',
    tutorials_card_description: 'Learn how to use Rosterly.',
  },
};

/**
 * Get the language from URLSearchParams-style or plain object.
 * This version is safe for Server Components (Next.js 14+)
 */
export function getLangFromSearchParams(
  params?: { [key: string]: string | string[] | undefined }
): Lang {
  if (!params) return 'he';

  const rawLang = params.lang;
  if (typeof rawLang === 'string' && (rawLang === 'he' || rawLang === 'en')) {
    return rawLang;
  }

  return 'he';
}
