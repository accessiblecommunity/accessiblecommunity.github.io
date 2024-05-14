import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const collectionEntries = await getCollection('atotw');

// Map the array of content collection entries to create an object.
// Converts [{ id: 'post.md', data: { title: 'Example', description: '' } }]
// to { 'post.md': { title: 'Example', description: '' } }
const pages = Object.fromEntries(collectionEntries.map(({ slug, data }) => [slug, data]));

export const { getStaticPaths, GET } = OGImageRoute({
    param: 'route',
    pages: pages,

    getImageOptions: (path, page) => ({
        title: page.title,
        description: page.summary,
        fonts: [
            'https://api.fontsource.org/v1/fonts/archivo/latin-400-normal.ttf',
            'https://api.fontsource.org/v1/fonts/archivo/latin-700-normal.ttf',
        ],
        font: {
            title: {
                weight: 'Bold',
                families: ['Archivo',],
            },
            description: {
                families: ['Archivo',],
            },
        },
        logo: {
            path: "./src/images/ac-logo-white.png",
            size: [50], 
        },
        bgGradient: [[4, 16, 88], [8, 33, 173]],
        // bgImage: {
        //     path: "./src/images/colored-hero/policy.png",
        //     fit: 'cover',
        //     position: 'center',
        // },
    }),
});