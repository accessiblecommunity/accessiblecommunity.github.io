import { getCollection, getEntries } from 'astro:content';
import { isEmpty, isNil, reverse, sortBy, uniqBy } from 'lodash-es';


export async function getBlogAuthors(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  // Slug uniqueness is key.
  const authorSlugs = [...new Set(blogs.map(b => b.data.author.slug).flat())];
  const authorRefs = authorSlugs.map(slug => ({
    slug, collection: 'team',
  }));
  const authors = await getEntries(authorRefs);
  return authors
}

export async function getBlogTopics(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];
  const topics = [...new Set(blogs.map((blog) => blog.data.tags).flat())];
  topics.sort();
  return topics
}

export async function getBlogDates(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];

  const dates = blogs.map((blog) => ({
    date: blog.data.published,
    sort: parseFloat(`${blog.data.published.getYear()}.${blog.data.published.getMonth()}`),
  }));

  const sortedDates = sortBy(dates, ['sort']);
  const uniqueDates = uniqBy(sortedDates, 'sort');
  reverse(uniqueDates);

  return uniqueDates.map(({ date }) => date.toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'long',
  }));
}

export async function orderByRecent(blogs?) {
  blogs = isNil(blogs) ? await getCollection('blogs') : blogs;
  if (isEmpty(blogs))
    return [];

  const sortedBlogs = sortBy(blogs, [
    b => b.data.published.getTime(),
    b => b.data.title
  ]);
  reverse(sortedBlogs);
  return sortedBlogs;
}

export async function getMostRecent(blogs?) {
  const sortedBlogs = await orderByRecent(blogs);
  return sortedBlogs[0];
}

export async function getBlogCatalog(blogs?) {
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