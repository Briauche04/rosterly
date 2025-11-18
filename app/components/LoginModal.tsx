'use client';

import { useState, FormEvent } from 'react';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (idNumber: string, phone: string) => Promise<void> | void;
};

export default function LoginModal({ open, onClose, onSubmit }: LoginModalProps) {
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!idNumber.trim() || !phone.trim()) {
      setError('נא למלא תעודת זהות ומספר טלפון.');
      return;
    }

    try {
      setLoading(true);

      if (onSubmit) {
        await onSubmit(idNumber.trim(), phone.trim());
      } else {
        console.log('Login requested with:', { idNumber, phone });
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError('שגיאה בהתחברות. נסה/י שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-modal-backdrop">
      <div className="login-modal" dir="rtl">
        <button className="login-modal-close" onClick={onClose} type="button">
          ✕
        </button>

        <div className="login-modal-header">
          <div className="logo-pill">Rosterly</div>
          <h2>התחברות לחשבון</h2>
          <p>
            התחברות עם תעודת זהות ומספר טלפון כפי שמופיעים בכרטיס העובד.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-modal-form">
          <label className="field">
            <span className="field-label">תעודת זהות</span>
            <input
              type="text"
              inputMode="numeric"
              className="field-input"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="למשל: 012345678"
            />
          </label>

          <label className="field">
            <span className="field-label">מספר טלפון</span>
            <input
              type="tel"
              className="field-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="למשל: 050-1234567"
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <p className="login-hint">
            ההתחברות בפועל למערכת תוגדר בהמשך. כרגע זה מסך הדגמה לצוות.
          </p>

          <div className="login-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'מתחבר/ת...' : 'התחברות'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={onClose}
              disabled={loading}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .login-modal {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #efe6d8;
          border-radius: 22px;
          padding: 20px 22px 18px;
          box-shadow: 0 22px 45px rgba(0, 0, 0, 0.25);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            sans-serif;
          color: #3a3e2d;
        }

        .login-modal-close {
          position: absolute;
          top: 10px;
          left: 12px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          color: #7b7264;
        }

        .login-modal-header {
          text-align: right;
          margin-bottom: 14px;
        }

        .logo-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f0e7d8;
          color: #4f553d;
          font-size: 11px;
          font-weight: 500;
          margin-bottom: 6px;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
        }

        .login-modal-header h2 {
          margin: 0 0 4px;
          font-size: 17px;
          font-weight: 600;
        }

        .login-modal-header p {
          margin: 0;
          font-size: 12px;
          color: #7c7364;
        }

        .login-modal-form {
          margin-top: 6px;
        }

        .field {
          display: block;
          margin-bottom: 10px;
          text-align: right;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 3px;
          color: #3a3e2d;
        }

        .field-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d9cfbf;
          padding: 7px 9px;
          font-size: 13px;
          background: #f7f2e9;
          color: #3a3e2d;
          outline: none;
        }

        .field-input:focus {
          border-color: #b4b08f;
        }

        .login-error {
          margin: 4px 0 0;
          font-size: 11px;
          color: #7a2020;
        }

        .login-hint {
          margin: 8px 0 0;
          font-size: 10px;
          color: #8b8172;
        }

        .login-actions {
          margin-top: 14px;
          display: flex;
          justify-content: flex-start;
          gap: 8px;
        }

        .primary-button {
          border: none;
          outline: none;
          padding: 7px 18px;
          border-radius: 999px;
          background: #4f553d;
          color: #f5f3ef;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .primary-button:disabled {
          opacity: 0.7;
          cursor: default;
          box-shadow: none;
        }

        .ghost-button {
          border-radius: 999px;
          border: 1px solid #cfc6b7;
          padding: 7px 14px;
          font-size: 12px;
          background: transparent;
          color: #6b6458;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .login-modal {
            margin: 0 16px;
          }
        }
      `}</style>
    </div>
  );
}
