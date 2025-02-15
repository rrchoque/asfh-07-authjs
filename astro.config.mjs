// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";

import db from "@astrojs/db";

import auth from "auth-astro";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: netlify(),
  integrations: [db(), auth(), react()],

  vite: {
    plugins: [tailwindcss()],
  },
});