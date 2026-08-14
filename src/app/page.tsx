import { Hero } from "@/components/home/Hero";
import { BrandStory } from "@/components/home/BrandStory";
import { Bestsellers } from "@/components/home/Bestsellers";
import { QuizTeaser } from "@/components/home/QuizTeaser";
import { SocialProof } from "@/components/home/SocialProof";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandStory />
      <Bestsellers />
      <QuizTeaser />
      <SocialProof />
    </>
  );
}
