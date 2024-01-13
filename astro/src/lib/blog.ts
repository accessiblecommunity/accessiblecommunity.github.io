import { getCollection, getEntries } from 'astro:content';
import { isEmpty, isNil, sortBy } from 'lodash-es';


export async function getBlogAuthors(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  const authorRefs = [...new Set(blogs.map((blog) => blog.data.author).flat())];
  const authors = await getEntries(authorRefs);
  return authors
}

export async function getBlogCategories(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  return [...new Set(blogs.map((blog) => blog.data.tags).flat())];
}

export async function getBlogMonths(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  return [...new Set(blogs.map((blog) => blog.data.published.toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'long',
  })))];
}

export async function getMostRecent(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];

  const sortedBlogs = sortBy(blogs, [b => b.data.published,]);
  return sortedBlogs.at(-1);
}

export async function getBlogCatalog(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  const categories = await getBlogCategories(blogs);
  const authors = await getBlogAuthors(blogs);
  const months = await getBlogMonths(blogs);
  const recent = await getMostRecent(blogs);

  return {
    blogs,
    authors,
    categories,
    months,
    recent,
  };
}  