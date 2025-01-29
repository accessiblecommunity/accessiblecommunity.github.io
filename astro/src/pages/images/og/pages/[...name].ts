// src/pages/open-graph/[...route].ts

import { OGImageRoute } from "astro-og-canvas";
import { merge } from "lodash-es";

export const { getStaticPaths, GET } = OGImageRoute({
  param: "name",
  pages: {
    donate: {
      title: "Support disability-inclusive communities.",
      description: `Accessible Community is a 501(c)3 organization.
Your donation goes towards supporting our programs and technology to build disability-friendly communities.`,
      bgImage: {
        path: "./src/images/colored-hero/donate.png",
        fit: "cover",
      },
      font: {
        title: {
          size: 60,
        },
        description: {
          size: 36,
        },
      },
      padding: 50,
    },
    evaluations: {
      title: "Is your website accessible?",
      description:
        "Accessible Community provides flat fee evaluations for small-to-medium websites and social media.",
      bgImage: {
        path: "./src/images/colored-hero/woman-using-laptop.png",
        fit: "fill",
        position: ["center", "start"],
      },
      logo: {
        size: [96],
      },
      padding: 67,
    },
    mentoring: {
      title: "mutua11y mentoring",
      description:
        "A program that pairs senior experts with years of experience with novice digital accessibility professionals to mentor and guide them in their career development.",
      bgImage: {
        path: "./src/images/colored-hero/hands-together.png",
        fit: "fill",
        position: ["center", "start"],
      },
      padding: 72,
      cacheDir: false,
    },
    tips: {
      title: "Accessibility Tip of the Week",
      description:
        "Once a week, in your inbox, you'll get a simple but effective accessibility tip. It's simple enough to start implementing within the week.",
      bgImage: {
        path: "./src/images/colored-hero/post-it-notes.png",
        fit: "fill",
        position: ["center", "start"],
      },
    },
    voices: {
      title: "Including disabled voices.",
      description:
        "Accessible Community provides flat fee digital accessibility evaluations for inclusion-centered nonprofits.",
      bgImage: {
        path: "./src/images/colored-hero/care-giver.png",
        fit: "fill",
        position: ["center", "start"],
      },
      logo: {
        size: [96],
      },
      padding: 67,
      cacheDir: false,
    },
    volunteer: {
      title: "Volunteer at Accessible Community",
      description:
        "Accessible Community is a volunteer-led and staffed 501(c)3 organization. We welcome any contributions to help make our communities more accessible and disability-inclusive.",
      font: {
        title: {
          size: 56,
        },
        description: {
          size: 36,
        },
      },
      bgImage: {
        path: "./src/images/colored-hero/team.png",
        fit: "cover",
        position: ["center", "start"],
      },
    },
    talk: {
      title: "Embrace accessibility.",
      description: `Prioritizing digital accessibility expands your market, clarifies your brand, increases your reach, improves your search engine optimization and it works better on mobile.

Oh, its legally required... and the right thing to do.

Join us to learn more.`,
      bgImage: {
        path: "./src/images/colored-hero/hands-together.png",
        fit: "cover",
        position: ["center", "start"],
      },
      font: {
        description: {
          size: 36,
        },
      },
      padding: 50,
    },
  },

  // @ts-expect-error
  getImageOptions: (path, page) => {
    const results = {};

    merge(
      results,
      {
        fonts: [
          "https://api.fontsource.org/v1/fonts/archivo/latin-400-normal.ttf",
          "https://api.fontsource.org/v1/fonts/archivo/latin-700-normal.ttf",
        ],
        font: {
          title: {
            weight: "Bold",
            families: ["Archivo"],
          },
          description: {
            families: ["Archivo"],
          },
        },
        logo: {
          path: "./src/images/ac-logo-white.png",
          size: [72],
        },
      },
      page,
    );

    return results;
  },
});
