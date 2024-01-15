import { getCollection, getEntries } from 'astro:content';
import { isEmpty, isNil, reverse, sortBy } from 'lodash-es';


export async function getBlogAuthors(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  const authorRefs = [...new Set(blogs.map((blog) => blog.data.author).flat())];
  const authors = await getEntries(authorRefs);
  return authors
}

export async function getBlogTopics(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  return [...new Set(blogs.map((blog) => blog.data.tags).flat())];
}

export async function getBlogDates(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  return [...new Set(blogs.map((blog) => blog.data.published.toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'long',
  })))];
}

export async function orderByRecent(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];

  const sortedBlogs = sortBy(blogs, [b => b.data.published,]);
  reverse(sortedBlogs);
  return sortedBlogs;
}

export async function getMostRecent(blogs?) {
  const sortedBlogs = await orderByRecent(blogs);
  return sortedBlogs[0];
}

export async function getBlogCatalog(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
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