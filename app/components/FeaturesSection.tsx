export default function FeaturesSection() {
  const items = [
    { title: "📅 מחולל משמרות חכם", body: "משבץ אוטומטי לפי זמינות, תפקיד ומטרות שבועיות." },
    { title: "🗳️ תזכורות הגשה", body: "מזכיר להגיש א׳–ג׳ ב-09:00—באפליקציה ובמייל." },
    { title: "💬 פורום פנימי", body: "בקשות/ביטולים לצוות ההנהלה + קבצים." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <h3 className="text-xl font-semibold">{it.title}</h3>
            <p className="mt-2 text-neutral-700">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
