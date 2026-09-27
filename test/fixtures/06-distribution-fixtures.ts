import type { FeedStory, SiteConfig } from "../../src/domain/06-distribution";

export const pagesConfig: SiteConfig = {
  siteUrl: "https://mrnednick.github.io",
  base: "/story-atlas/",
  title: "Story Atlas",
  description: "Illustrated long-form stories with maps, charts & sources.",
};

export const rootConfig: SiteConfig = { ...pagesConfig, siteUrl: "http://localhost:4321/", base: "/" };

export const feedStories: FeedStory[] = [
  { slug: "aral-sea", title: "The Sea That Moved Away", dek: "Two rivers & a <sea>", publishedAt: new Date("2026-09-20T00:00:00Z") },
  {
    slug: "lake-chad",
    title: "The Lake That Breathes",
    dek: "Lake Chad",
    publishedAt: new Date("2026-09-24T00:00:00Z"),
    updatedAt: new Date("2026-09-26T00:00:00Z"),
  },
];
