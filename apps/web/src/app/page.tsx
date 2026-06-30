import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Technology } from "@/components/marketing/technology";
import { UseCases } from "@/components/marketing/use-cases";
import { Ecosystem } from "@/components/marketing/ecosystem";
import { Tokenomics } from "@/components/marketing/tokenomics";
import { Roadmap } from "@/components/marketing/roadmap";
import { Developers } from "@/components/marketing/developers";
import { FinalCta } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <Technology />
        <UseCases />
        <Ecosystem />
        <Tokenomics />
        <Roadmap />
        <Developers />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
