import { getCollection, type CollectionEntry } from "astro:content";
import {
  compact,
  intersection,
  isEmpty,
  isNil,
  reverse,
  sortBy,
} from "lodash-es";

export async function getTipCategories(tips?) {
  tips = isNil(tips) ? await getCollection("atotw") : tips;
  if (isEmpty(tips)) return [];
  const topics = compact([
    ...new Set(tips.map((blog) => blog.data.tags).flat()),
  ]);
  topics.sort();
  return topics;
}

export async function getRelatedTips(tip) {
  const relatedTips = await getCollection("atotw", ({ id, data }) => {
    return id != tip.id && !isEmpty(intersection(tip.data.tags, data.tags));
  });
  const orderedTips = await orderByRecent(relatedTips);
  return orderedTips;
}

export async function orderByRecent(tips?) {
  tips = isNil(tips) ? await getCollection("atotw") : tips;
  if (isEmpty(tips)) return [];

  const sortedBlogs = sortBy(tips, [
    (b) => b.data.published.getTime(),
    (b) => b.data.title,
  ]);
  reverse(sortedBlogs);
  return sortedBlogs;
}

export async function getMostRecent(tips?): Promise<CollectionEntry<"atotw">> {
  const sortedBlogs = await orderByRecent(tips);
  return sortedBlogs[0];
}

export interface TipCatalog {
  tips: Array<CollectionEntry<"atotw">>;
  categories: Array<string>;
  recent: CollectionEntry<"atotw">;
}

export async function getTipCatalog(tips?): Promise<TipCatalog> {
  tips = isNil(tips) ? await orderByRecent(tips) : tips;
  const categories = await getTipCategories(tips);
  const recent = await getMostRecent(tips);

  return {
    tips,
    categories,
    recent,
  };
}
