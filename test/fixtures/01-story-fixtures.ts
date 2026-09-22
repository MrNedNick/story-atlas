export const validStoryInput = {
  slug: "the-vanishing-glacier",
  title: "The Vanishing Glacier",
  dek: "A decade of satellite maps and field notes on a retreating ice sheet.",
  publishedAt: "2026-01-15",
  chapters: [
    {
      id: "ch-1",
      order: 1,
      title: "The retreat begins",
      bodyRef: "the-vanishing-glacier/01-the-retreat-begins.mdx",
      illustrations: [
        {
          id: "il-1",
          kind: "map",
          src: "/stories/the-vanishing-glacier/extent-1990.svg",
          alt: "Map of the glacier's extent in 1990 compared to 2020",
          caption: "Ice extent, 1990 vs. 2020",
        },
      ],
      citations: [
        {
          id: "ci-1",
          text: "Glacier retreat accelerated after 1998",
          source: "National Snow and Ice Data Center",
          url: "https://nsidc.org",
        },
      ],
    },
  ],
};

export const invalidStoryInputs: Record<string, unknown> = {
  missingChapters: {
    slug: "empty-story",
    title: "Empty Story",
    dek: "No chapters at all.",
    publishedAt: "2026-01-15",
    chapters: [],
  },
  badSlug: {
    slug: "Not A Slug!",
    title: "Bad Slug",
    dek: "Slug has spaces and uppercase.",
    publishedAt: "2026-01-15",
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Chapter one",
        bodyRef: "bad-slug/01.mdx",
        illustrations: [],
        citations: [],
      },
    ],
  },
  illustrationMissingAlt: {
    slug: "missing-alt",
    title: "Missing Alt",
    dek: "An illustration without alt text.",
    publishedAt: "2026-01-15",
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Chapter one",
        bodyRef: "missing-alt/01.mdx",
        illustrations: [
          {
            id: "il-1",
            kind: "photo",
            src: "/stories/missing-alt/photo.jpg",
            alt: "",
          },
        ],
        citations: [],
      },
    ],
  },
};
