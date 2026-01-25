'use client';

import { useState } from 'react';
import {
  CHOICES_WEEKDAY,
  CHOICES_WEEKEND,
  WEEKDAYS,
  WEEKEND,
} from './choices';

function todayPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function SubmitClient({ lang }: { lang: string }) {
  const weekStart = todayPlusDays(5);
  const [weekdayChoices, setWeekdayChoices] = useState<string[]>(
    Array(WEEKDAYS.length).fill('')
  );
  const [weekendChoice, setWeekendChoice] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    alert('הטופס נשלח!');
  };

  return (
    <main className="landing-main">
      {/* ✅ LOGO CARD – copied from home layout */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img
          src="/logo.png"
          alt="Rosterly"
          className="logo"
          style={{
            maxWidth: '160px',
            margin: '0 auto 1rem',
            display: 'block',
            borderRadius: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
          }}
        />
      </div>

      {/* ✅ Form Card */}
      <div className="center-card">
        <h2 style={{ marginTop: 0 }}>הגשת משמרת לצוות החנות</h2>
        <p>סימון זמינות לשבוע שמתחיל ב־{formatDate(weekStart)}</p>

        <h3>טופס זמינות לשבוע הקרוב</h3>

        {/* Weekday Selections */}
        {WEEKDAYS.map((day, idx) => (
          <div key={day} className="form-row">
            <label>{day}</label>
            <select
              value={weekdayChoices[idx]}
              onChange={(e) => {
                const updated = [...weekdayChoices];
                updated[idx] = e.target.value;
                setWeekdayChoices(updated);
              }}
            >
              <option value="">בחר</option>
              {CHOICES_WEEKDAY.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Weekend Selection */}
        <div className="form-row">
          <label>{WEEKEND}</label>
          <select
            value={weekendChoice}
            onChange={(e) => setWeekendChoice(e.target.value)}
          >
            <option value="">בחר</option>
            {CHOICES_WEEKEND.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="form-row">
          <label>הערה כללית למנהל</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות משמרת, קיום בעיות, הגבלות שעות ועוד"
          />
        </div>

        <button onClick={handleSubmit}>שלח הטופס</button>
      </div>
    </main>
  );
}
