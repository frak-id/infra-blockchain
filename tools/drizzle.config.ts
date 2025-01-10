import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.POSTGRES_HOST ?? "",
        port: Number.parseInt(process.env.POSTGRES_PORT ?? "5432"),
        database: process.env.POSTGRES_DB ?? "",
        user: process.env.POSTGRES_USER ?? "",
        password: process.env.POSTGRES_PASSWORD ?? "",
        ssl: false,
    },
});
