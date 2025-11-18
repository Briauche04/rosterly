"use client";

import { supabase } from "@/lib/supabase";

console.log('DEBUG from page.tsx', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('DEBUG from page.tsx', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const days = [
  { key: "sun", label: "ראשון" },
  { key: "mon", label: "שני" },
  { key: "tue", label: "שלישי" },
  { key: "wed", label: "רביעי" },
  { key: "thu", label: "חמישי" },
  { key: "fri", label: "שישי" },
  { key: "sat", label: "שבת" },
];

const options = ["פתוח", "בוקר", "אמצע", "ערב", "X"];

export default function ShiftPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🧭 Fetch employee info on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("❌ לא נמצא משתמש מחובר");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
        setMessage("⚠️ שגיאה בשליפת פרטי עובד");
      } else {
        setEmployee(data);
      }
      setLoading(false);
    })();
  }, []);

  // 📝 Handle selection
  const handleSelect = (day: string, value: string) => {
    setSelected((prev) => ({ ...prev, [day]: value }));
  };

  // 📨 Submit shifts
  const handleSubmit = async () => {
    if (!employee) return;

    setMessage("שולח...");
    const weekStart = new Date(); // 🕐 for MVP we use current week start

    // 1️⃣ Create submission
    const { data: sub, error: subError } = await supabase
      .from("submissions")
      .insert([
        {
          week_start: weekStart.toISOString().split("T")[0],
          employee_id: employee.id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (subError) {
      console.error(subError);
      setMessage("❌ שגיאה ביצירת ההגשה");
      return;
    }

    // 2️⃣ Insert day selections
    const dayEntries = days.map((d) => ({
      submission_id: sub.id,
      day: d.key,
      selection: selected[d.key] || "X",
    }));

    const { error: dayError } = await supabase
      .from("submission_days")
      .insert(dayEntries);

    if (dayError) {
      console.error(dayError);
      setMessage("❌ שגיאה בשמירת הימים");
    } else {
      setMessage("✅ ההגשה נקלטה בהצלחה!");
    }
  };

  if (loading) return <div>טוען...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">🕓 הגשת משמרות</h2>

      {employee && (
        <div className="mb-4">
          עובד: <strong>{employee.display_name}</strong> ({employee.contract_type})
        </div>
      )}

      <div className="space-y-4">
        {days.map((d) => (
          <div key={d.key}>
            <div className="font-semibold">{d.label}</div>
            <div className="flex gap-2 mt-1">
              {options.map((opt) => (
                <label key={opt} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={d.key}
                    value={opt}
                    checked={selected[d.key] === opt}
                    onChange={() => handleSelect(d.key, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        שלח
      </button>

      {message && <div className="mt-4 font-bold">{message}</div>}
    </div>
  );
}
