import { betterAuth } from "better-auth";
import { db } from "../db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
	// baseURL: import.meta.env.BASE_URL,
	baseURL: import.meta.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    // emailAndPassword: {
    //     enabled: true,
    // },
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, token, url }, ctx) => {
                console.log("ml", email, token, url)
            }
        })
    ]
});
