import { Hero } from "@/components/home/Hero";
import { PressStrip } from "@/components/home/PressStrip";
import { BrandStory } from "@/components/home/BrandStory";
import { Bestsellers } from "@/components/home/Bestsellers";
import { QuizTeaser } from "@/components/home/QuizTeaser";
import { SocialProof } from "@/components/home/SocialProof";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <>
      <Hero />
      <PressStrip />
      <BrandStory />
      <Bestsellers />
      <QuizTeaser />
      <SocialProof />
      <NewsletterSection />
    </>
  );
}
