declare var chrome: any;

import(chrome.extension.getURL("core/content-main.js")).catch(console.error);
