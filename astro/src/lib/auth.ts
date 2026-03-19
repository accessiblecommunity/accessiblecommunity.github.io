import { betterAuth } from "better-auth";
import { db } from "../db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import * as schema from "src/db/schema/auth"

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import MagicLinkEmail from "src/emails/MagicLink.astro";

export const auth = betterAuth({
	// baseURL: import.meta.env.BASE_URL,
	baseURL: import.meta.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    // emailAndPassword: {
    //     enabled: true,
    // },
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, token, url }, ctx) => {
                // Outside of Astro's context, must build this manually.
                const container = await AstroContainer.create();
                container.addServerRenderer({ renderer: reactRenderer });

                const result = await container.renderToString(MagicLinkEmail, {
                    props: { href: url, loginCode: token },
                });

                // TODO: Replace this with the email generation.
                console.log("ml", result);
            }
        })
    ]
});
