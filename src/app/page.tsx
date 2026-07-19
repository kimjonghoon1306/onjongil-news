import { ARTICLES, CATEGORIES } from "@/data";
import { TopStory, HeadlineList, DeadlineStrip, Section } from "@/components/news";
import AdSlider from "@/components/AdSlider";

export default function Home() {
  const featured = ARTICLES.find((a) => a.featured)!;
  const headlines = ARTICLES.filter((a) => !a.featured).slice(0, 4);

  return (
    <main className="wrap home">
      <div className="hero">
        <TopStory a={featured} />
        <HeadlineList items={headlines} />
      </div>
      <DeadlineStrip />
      <AdSlider />
      {CATEGORIES.map((c) => <Section key={c.id} id={c.id} />)}
    </main>
  );
}
