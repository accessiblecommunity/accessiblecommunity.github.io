import { getCollection, getEntries } from "astro:content";
import { compact, isEmpty, isNil, kebabCase, reverse, sortBy, uniqBy } from "lodash-es";

export async function getTipCategories(tips?) {
  tips = isNil(tips) ? await getCollection("atotw") : tips;
  if (isEmpty(tips)) return [];
  const topics = compact([...new Set(
    tips.map((blog) => blog.data.tags).flat()
  )]);
  topics.sort();
  return topics;
}

export async function getTipDates(tips?) {
  tips = isNil(tips) ? await getCollection("atotw") : tips;
  if (isEmpty(tips)) return [];

  const dates = tips.map((blog) => ({
    date: blog.data.published,
    sort: parseFloat(
      `${blog.data.published.getYear()}.${blog.data.published.getMonth()}`,
    ),
  }));

  const sortedDates = sortBy(dates, ["sort"]);
  const uniqueDates = uniqBy(sortedDates, "sort");
  reverse(uniqueDates);

  return uniqueDates.map(({ date }) =>
    date.toLocaleDateString("en-us", {
      year: "numeric",
      month: "long",
    }),
  );
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
