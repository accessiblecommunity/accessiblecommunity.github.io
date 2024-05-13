import { getCollection, } from "astro:content";
import { compact, intersection, isEmpty, isNil, reverse, sortBy } from "lodash-es";

export async function getTipCategories(tips?) {
  tips = isNil(tips) ? await getCollection("atotw") : tips;
  if (isEmpty(tips)) return [];
  const topics = compact([...new Set(
    tips.map((blog) => blog.data.tags).flat()
  )]);
  topics.sort();
  return topics;
}

export async function getRelatedTips(tip) {
  const relatedTips = await getCollection("atotw", ({ slug, data }) => {
    return slug != tip.slug && !isEmpty(intersection(tip.data.tags, data.tags));
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

export async function getMostRecent(tips?) {
  const sortedBlogs = await orderByRecent(tips);
  return sortedBlogs[0];
}


export async function getTipCatalog(tips?) {
  tips = isNil(tips) ? await orderByRecent(tips) : tips;
  const categories = await getTipCategories(tips);
  const recent = await getMostRecent(tips);

  return {
    tips,
    categories,
    recent,
  };
}
