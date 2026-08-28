import type { Scores } from "./levers";

/**
 * Reference anchors: the most leveraged humans alive, scored on the same
 * 0 to 100 scale as the diagnostic, where 100 is the frontier use of that
 * lever by any living person. Editorial estimates, not audits. The point is
 * the shape, not the precision: the index rewards maxing all four at once,
 * which is why the richest person on the list is not the most leveraged.
 */
export interface Anchor {
  key: string;
  name: string;
  tag: string;
  note: string;
  scores: Scores;
}

export const ANCHORS: Anchor[] = [
  {
    key: "musk",
    name: "Elon Musk",
    tag: "The only one maxing all four",
    note: "Rockets, cars, robots, and a feed. Roughly 140,000 people, equity he controls, and the platform he bought to amplify all of it.",
    scores: { code: 95, media: 97, capital: 98, labor: 99 },
  },
  {
    key: "bezos",
    name: "Jeff Bezos",
    tag: "Systems, scale, a million hands",
    note: "Warehouses that run on code, capital compounding since 1997, and over a million employees executing the machine.",
    scores: { code: 90, media: 55, capital: 99, labor: 99 },
  },
  {
    key: "naval",
    name: "Naval Ravikant",
    tag: "Wrote the playbook",
    note: "Coined the four levers, then ran them: a product, an angel portfolio, and permanent reach from one podcast feed. Small teams by design.",
    scores: { code: 70, media: 90, capital: 90, labor: 35 },
  },
  {
    key: "torvalds",
    name: "Linus Torvalds",
    tag: "Code pinned at the ceiling",
    note: "Created Linux and built an ecosystem that now runs across servers, cloud infrastructure, and billions of devices without depending on his hours.",
    scores: { code: 100, media: 30, capital: 15, labor: 65 },
  },
  {
    key: "mrbeast",
    name: "MrBeast",
    tag: "Media pinned at the ceiling",
    note: "The most watched individual on earth, converted into brands and a 300-person studio. One lever at the absolute maximum.",
    scores: { code: 25, media: 100, capital: 70, labor: 85 },
  },
  {
    key: "buffett",
    name: "Warren Buffett",
    tag: "Capital pinned at the ceiling",
    note: "A frontier capital stack run from a famously small headquarters. The specialization shows why capital alone does not top the combined index.",
    scores: { code: 3, media: 50, capital: 100, labor: 70 },
  },
];
