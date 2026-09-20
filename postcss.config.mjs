/**
 * Tailwind v4 is a PostCSS plugin and nothing else — no tailwind.config.js and
 * no content globs. The theme is declared inside src/app/globals.css with
 * @theme, which is why there is no configuration file to keep in step with
 * this one.
 */

export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
