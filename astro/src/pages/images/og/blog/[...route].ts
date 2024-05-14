import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const collectionEntries = await getCollection('blogs');

// Map the array of content collection entries to create an object.
// Converts [{ id: 'post.md', data: { title: 'Example', description: '' } }]
// to { 'post.md': { title: 'Example', description: '' } }
const pages = Object.fromEntries(collectionEntries.map(({ slug, data }) => [slug, data]));

export const { getStaticPaths, GET } = OGImageRoute({
    param: 'route',
    pages: pages,

    getImageOptions: (path, page) => ({
        title: page.title,
        description: page.title,
        logo: {
            path: "./src/images/ac-logo-white.png",
            size: [50], 
        },
        bgImage: {
            path: "./src/images/colored-hero/pen-paper.png",
            fit: 'cover',
            position: 'center',
        },
    }),
});