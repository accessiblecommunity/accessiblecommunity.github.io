import type { CollectionEntry, ReferenceDataEntry } from "astro:content";

import { getCollection, getEntries, } from "astro:content";
import { isEmpty, isNil, reverse, sortBy, uniqBy } from "lodash-es";

type Blog = CollectionEntry<"blogs">;
type Blogs = Array<Blog>;

export function formatAuthorName(author: CollectionEntry<"staff">): string {
  const { name, cited } = author.data;
  const { first, middle, last } = cited || name;
  return [first, middle, last].filter((n) => n).join(" ");
}

export async function getBlogAuthors(
  blogs?: Blogs,
): Promise<Array<CollectionEntry<"staff">>> {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];
  // Id uniqueness is key.
  const authorIDs = [...new Set(blogs.map((b) => b.data.author.id).flat())];
  const authorRefs: Array<ReferenceDataEntry<"staff">> = authorIDs.map((id) => ({
    id,
    collection: "staff",
  }));
  const authors: Array<CollectionEntry<"staff">> = await getEntries(authorRefs);
  return sortBy(authors, ["data.name.first"]);
}

export async function getBlogTopics(blogs?: Blogs) {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];
  const topics = [...new Set(blogs.map((blog) => blog.data.tags).flat())];
  topics.sort();
  return topics;
}

export async function getBlogDates(blogs?: Blogs) {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];

  const dates = blogs.map((blog) => ({
    date: blog.data.published,
    sort: `${blog.data.published.getFullYear()}.${blog.data.published.getMonth().toLocaleString(
      'en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      }
    )}`,
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

export async function orderByRecent(blogs?: Blogs) {
  blogs = isNil(blogs) ? await getCollection("blogs") : blogs;
  if (isEmpty(blogs)) return [];

  const sortedBlogs = sortBy(blogs, [
    (b) => b.data.published.getTime(),
    (b) => b.data.title,
  ]);
  reverse(sortedBlogs);
  return sortedBlogs;
}

export async function getMostRecent(blogs?: Blogs) {
  const sortedBlogs = await orderByRecent(blogs);
  return sortedBlogs[0];
}

export interface BlogCatalog {
  blogs: Blogs;
  authors: Array<CollectionEntry<"staff">>;
  topics: Array<string>;
  dates: Array<string>;
  recent: Blog;
}

export async function getBlogCatalog(blogs?: Blogs): Promise<BlogCatalog> {
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
