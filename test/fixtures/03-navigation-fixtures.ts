import type { ChapterOutline } from "../../src/domain/03-navigation";

export const shortChapter: ChapterOutline = { order: 1, title: "A sea in the desert", words: 120, headings: [] };

export const longChapter: ChapterOutline = {
  order: 2,
  title: "Rivers turned to fields",
  words: 230 * 9,
  headings: [
    { depth: 3, slug: "the-canals", text: "The canals" },
    { depth: 3, slug: "хлопок", text: "Хлопок" },
    { depth: 4, slug: "too-deep", text: "Too deep for the contents" },
  ],
};

export const cyrillicChapter: ChapterOutline = { order: 3, title: "Две разные судьбы", words: 300, headings: [] };

export const duplicateOrder: ChapterOutline[] = [shortChapter, { ...longChapter, order: 1 }];
export const blankTitle: ChapterOutline[] = [{ ...shortChapter, title: "   " }];
