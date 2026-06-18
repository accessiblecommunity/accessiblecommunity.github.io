import type { CollectionEntry, ReferenceDataEntry } from "astro:content";

import { getCollection } from "astro:content";
import {
  compact,
  intersection,
  isEmpty,
  isNil,
  reverse,
  sortBy,
} from "lodash-es";

type Tip = CollectionEntry<"atotw">;
type Tips = Array<Tip>;

export async function getTipCategories(tips?: Tips) {
  tips = isNil(tips) ? await getCollection("atotw") : tips;
  if (isEmpty(tips)) return [];
  const topics = compact([
    ...new Set(tips!.map((t) => t.data.tags).flat()),
  ]);
  topics.sort();
  return topics;
}

export async function getRelatedTips(tip: Tip) {
  const relatedTips: Tips = await getCollection("atotw", ({ id, data }) => {
    return id != tip.id && !isEmpty(intersection(tip.data.tags, data.tags));
  });
  const orderedTips = await orderByRecent(relatedTips);
  return orderedTips;
}

export async function orderByRecent(tips?: Tips) {
  tips = isNil(tips) ? await getCollection("atotw") : tips;
  if (isEmpty(tips)) return [];

  const sortedTips = sortBy(tips, [
    (b) => b.data.published.getTime(),
    (b) => b.data.title,
  ]);
  reverse(sortedTips);
  return sortedTips;
}

export async function getMostRecent(tips?: Tips): Promise<CollectionEntry<"atotw">> {
  const sortedTips = await orderByRecent(tips);
  return sortedTips[0];
}

export interface TipCatalog {
  tips: Tips;
  categories: Array<string>;
  recent: Tip;
}

export async function getTipCatalog(tips?: Tips): Promise<TipCatalog> {
  tips = isNil(tips) ? await orderByRecent(tips) : tips;
  const categories = await getTipCategories(tips);
  const recent = await getMostRecent(tips);

  return {
    tips,
    categories,
    recent,
  };
}
