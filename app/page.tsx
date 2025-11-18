'use client';

import SiteHeader from "./components/SiteHeader";
import HeroShowcase from "./components/HeroShowcase";
import FeaturesSection from "./components/FeaturesSection";
import SiteFooter from "./components/SiteFooter";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <HeroShowcase />
      <FeaturesSection />
      <SiteFooter />
    </main>
  );
}
