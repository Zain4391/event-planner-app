import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

export default defineConfig({
    schema: './src/database/schemas/*.schema.ts',
    out: './src/database/migrations',
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    introspect: {
        casing: 'camel'
    }
});