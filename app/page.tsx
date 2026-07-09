import { Header, Hero, Features, Pricing, Footer } from '@/components/landing/sections';

export default function Home() {
  return (
    <main className="min-h-screen bg-[hsl(220,16%,6%)]">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
