import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Data control",
    permissions: ["storage", "sidePanel", "clipboardWrite"],
  },
  vite: () => ({
    build: {
      modulePreload: false,
    },
  }),
});
