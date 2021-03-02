module.exports = {
  "{src,types}/**/*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --color"],
  "*.{js,json,html,css,md}": ["prettier --write"],
};
