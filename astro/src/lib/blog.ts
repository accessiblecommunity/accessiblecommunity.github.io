import { getCollection, getEntries, type CollectionEntry } from "astro:content";
import { isEmpty, isNil, reverse, sortBy, uniqBy } from "lodash-es";

export async function getBlogAuthors(
  blogs?,
): Promise<Array<CollectionEntry<"staff">>> {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];
  // Id uniqueness is key.
  const authorIDs = [...new Set(blogs.map((b) => b.data.author.id).flat())];
  const authorRefs = authorIDs.map((id) => ({
    id,
    collection: "staff",
  }));
  const authors: Array<CollectionEntry<"staff">> = await getEntries(authorRefs);
  return authors;
}

export async function getBlogTopics(blogs?) {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];
  const topics = [...new Set(blogs.map((blog) => blog.data.tags).flat())];
  topics.sort();
  return topics;
}

export async function getBlogDates(blogs?) {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];

  const dates = blogs.map((blog) => ({
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

export async function orderByRecent(blogs?) {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];

  const sortedBlogs = sortBy(blogs, [
    (b) => b.data.published.getTime(),
    (b) => b.data.title,
  ]);
  reverse(sortedBlogs);
  return sortedBlogs;
}

export async function getMostRecent(blogs?) {
  const sortedBlogs = await orderByRecent(blogs);
  return sortedBlogs[0];
}

export interface BlogCatalog {
  blogs: Array<CollectionEntry<"blogs">>;
  authors: Array<CollectionEntry<"staff">>;
  topics: Array<string>;
  dates: Array<string>;
  recent: CollectionEntry<"blogs">;
}

export async function getBlogCatalog(blogs?): Promise<BlogCatalog> {
  blogs = isNil(blogs) ? await orderByRecent(blogs) : blogs;
  const topics = await getBlogTopics(blogs);
  const authors = await getBlogAuthors(blogs);
  const dates = await getBlogDates(blogs);
  const recent = await getMostRecent(blogs);

  return {
    blogs,
    authors,
    topics,
    dates,
    recent,
  };
}
