export default () => ({
  name: "style-guide",
  hooks: {
    "astro:config:setup": ({ addDevToolbarApp }) => {
      addDevToolbarApp("./style-guide/style-guide.js");
    },
  },
});
