import path from "path";

export default {
  resolve: {
    extensions: ['.vue', '.js', '.ts', '.tsx', '.jsx'],
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src/"),
      }
      //,
      // {
      //   find: /(^(?!.*[.](ts|js|tsx|jsx|vue|)$))/,
      //   replacement: "$1/index.vue",
      // },
    ],
    build: {
      sourcemap: true,
    }
  },
  build: {
    sourcemap: true,
  },
  css: {
  },
  optimizeDeps: {
    include: ["vue-xlsx", "vue-xlsx/dist/vue-xlsx.es"],
  },
  define: {
    "process.env": process.env,
  },
}
