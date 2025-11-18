export default function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between py-6 text-sm text-neutral-600">
        <span>© {new Date().getFullYear()} Rosterly</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-neutral-900">תנאים</a>
          <a href="#" className="hover:text-neutral-900">פרטיות</a>
          <a href="#" className="hover:text-neutral-900">צור קשר</a>
        </div>
      </div>
    </footer>
  );
}
