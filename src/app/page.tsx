import { CATEGORIES } from "@/data";
import { getArticles } from "@/lib/articles";
import { TopStory, HeadlineList, DeadlineStrip, Section } from "@/components/news";
import AdSlider from "@/components/AdSlider";

export const revalidate = 30; // 발행 후 최대 30초 내 반영

export default async function Home() {
  const articles = await getArticles();
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const headlines = articles.filter((a) => a.id !== featured?.id).slice(0, 4);

  return (
    <main className="wrap home">
      <div className="hero">
        {featured && <TopStory a={featured} />}
        <HeadlineList items={headlines} />
      </div>
      <DeadlineStrip />
      <AdSlider />
      {CATEGORIES.map((c) => <Section key={c.id} id={c.id} articles={articles} />)}
    </main>
  );
}
