import Link from "next/link";

export default function HeroShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-10 py-16 md:py-24">
      <div className="order-2 md:order-1">
        <div className="relative rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 overflow-hidden max-w-lg mx-auto">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_10%_10%,rgba(52,139,121,0.12),transparent),radial-gradient(500px_250px_at_90%_80%,rgba(52,139,121,0.10),transparent)]" />
          <div className="relative grid h-64 grid-cols-7 place-items-center gap-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-[#A1AD9E]/80" />
            ))}
          </div>
          <span className="absolute -top-3 right-4 rounded-full bg-[var(--olive)] px-3 py-1 text-xs text-white shadow">
            תצוגת לוח
          </span>
        </div>
      </div>

      <div className="order-1 md:order-2 text-right">
        <h1 className="text-5xl md:text-7xl font-semibold leading-tight">
          נהל את המשמרות שלך<br/>בקלות
        </h1>
        <p className="mt-4 text-lg text-neutral-700">
          הכלי הפשוט והחכם לניהול צוותי Pull&Bear
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <Link href="/submit" className="rounded-full bg-[var(--olive)] px-6 py-3 text-white shadow hover:opacity-95">התחל עכשיו</Link>
          <Link href="/tutorials" className="rounded-full border px-6 py-3 text-neutral-800 hover:bg-white">למד עוד</Link>
        </div>
      </div>
    </section>
  );
}
