/**
 * Shared ESLint config for zkHelios Next.js apps.
 * Apps extend this via: { "extends": ["@zkhelios/eslint-config"] }
 */
module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "off",
  },
};
