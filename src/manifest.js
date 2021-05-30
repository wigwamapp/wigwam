/**
 * @param {string} version
 * @param {string} targetBrowser
 * @param {string[]} contentChunks
 * @param {string[]} webAccessibleResources
 * @returns {import("webextension-polyfill-ts").Manifest}
 */
module.exports = (
  version,
  _targetBrowser,
  contentChunks = [],
  webAccessibleResources = []
) => ({
  manifest_version: 2,
  name: "Vigvam",
  version,

  icons: {
    16: "misc/icon-16.png",
    19: "misc/icon-19.png",
    38: "misc/icon-38.png",
    128: "misc/icon-128.png",
  },

  description: "__MSG_appDesc__",
  homepage_url: "https://github.com/serh11p/vigvam",
  short_name: "Vigvam",

  permissions: [
    "tabs",
    "storage",
    "unlimitedStorage",
    "clipboardWrite",
    "activeTab",
  ],
  content_security_policy:
    "script-src 'self' 'sha256-a4v4czp2qnmr595pGYlZ07gEumM6d9R5qGz9t8CjuUE='; object-src 'self'",

  author: "",

  default_locale: "en",

  browser_action: {
    default_icon: {
      16: "misc/icon-16.png",
      19: "misc/icon-19.png",
      38: "misc/icon-38.png",
      128: "misc/icon-128.png",
    },
    default_title: "Vigvam",
    default_popup: "popup.html",
  },

  background: {
    page: "back.html",
    persistent: true,
  },

  content_scripts: [
    {
      matches: ["file://*/*", "http://*/*", "https://*/*"],
      js: contentChunks,
      run_at: "document_start",
      all_frames: true,
    },
  ],

  web_accessible_resources: webAccessibleResources,
});
