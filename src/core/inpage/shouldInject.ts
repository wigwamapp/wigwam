// Determines if the provider should be injected
export function shouldInject() {
  return (
    doctypeCheck() &&
    suffixCheck() &&
    documentElementCheck() &&
    !blockedDomainCheck()
  );
}

// Checks the doctype of the current document if it exists
function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === "html";
  }
  return true;
}

// Returns whether or not the extension (suffix) of the current document is prohibited
//
// This checks {@code window.location.pathname} against a set of file extensions
// that we should not inject the provider into. This check is indifferent of
// query parameters in the location.
function suffixCheck() {
  for (const type of [/\.xml$/u, /\.pdf$/u]) {
    if (type.test(window.location.pathname)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks the documentElement of the current document
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === "html";
  }
  return true;
}

// Checks if the current domain is blocked
function blockedDomainCheck() {
  const blockedDomains = [
    "uscourts.gov",
    "dropbox.com",
    "webbyawards.com",
    "cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html",
    "adyen.com",
    "gravityforms.com",
    "harbourair.com",
    "ani.gamer.com.tw",
    "blueskybooking.com",
    "sharefile.com",
  ];
  const currentUrl = window.location.href;
  let currentRegex;
  for (let i = 0; i < blockedDomains.length; i++) {
    const blockedDomain = blockedDomains[i].replace(".", "\\.");
    currentRegex = new RegExp(
      `(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`,
      "u",
    );
    if (!currentRegex.test(currentUrl)) {
      return true;
    }
  }
  return false;
}
