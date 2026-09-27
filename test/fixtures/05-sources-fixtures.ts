import type { ChapterCitations, StoryCard } from "../../src/domain/05-sources";

export const chapters: ChapterCitations[] = [
  {
    chapterId: "02-rivers",
    order: 2,
    title: "Rivers turned to fields",
    citations: [
      { id: "cotton", text: "Irrigated cotton in the Amu Darya basin", source: "FAO AQUASTAT", url: "https://www.fao.org/aquastat/#basins" },
      { id: "canal", text: "The Karakum Canal", source: "Micklin (2007)" },
    ],
  },
  {
    chapterId: "01-sea",
    order: 1,
    title: "A sea in the desert",
    citations: [{ id: "size", text: "Area in 1960", source: "FAO AQUASTAT", url: "https://www.fao.org/aquastat/" }],
  },
  {
    chapterId: "03-endings",
    order: 3,
    title: "Two different endings",
    citations: [{ id: "dam", text: "The Kok-Aral dam", source: "micklin (2007) " }],
  },
];

const card = (slug: string, publishedAt: string, topics: string[]): StoryCard => ({
  slug,
  title: slug,
  dek: `About ${slug}`,
  publishedAt: new Date(publishedAt),
  topics,
});

export const aral = card("aral-sea", "2026-09-20", ["water", "irrigation", "shrinking-lakes"]);
export const stories: StoryCard[] = [
  aral,
  card("lake-chad", "2026-09-24", ["water", "shrinking-lakes", "sahel"]),
  card("colorado-delta", "2026-09-10", ["water", "irrigation", "shrinking-lakes"]),
  card("city-trees", "2026-09-22", ["cities"]),
  card("dead-sea", "2026-12-01", ["water", "shrinking-lakes"]),
  card("canals", "2026-09-01", ["irrigation"]),
];
