import "./globals.css";
import { Heebo } from "next/font/google";

const heebo = Heebo({ subsets: ["hebrew"], variable: "--font-heebo" });

export const metadata = {
  title: "Rosterly",
  description: "Shift planning made simple",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} font-sans bg-gradient-to-b from-[#F2F4F6] to-[#F8F6F2] text-[#131515] antialiased`}>
        {children}
      </body>
    </html>
  );
}
