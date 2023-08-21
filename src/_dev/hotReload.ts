// Avoid typescript "isolatedModules" error;
export {};

type FileEntity = {
  file: File;
  insideBackground: boolean;
  insideContent: boolean;
  locale: boolean;
};

type ChecksumSnapshot = {
  common: string;
  background: string;
  content: string;
  locales: string;
  manifest: string;
};

const RELOAD_TAB_FLAG = "__hr_reload_tab";
const SLOW_DOWN_AFTER = 5 * 60_000; // 5 min

let contentScripts = getStaticContentScripts();
// Wait for the fresh content script to be loaded
// via browser.scripting.registerContentScripts()
setTimeout(scheduleContentScriptsUpdate, 300);

let backgroundScripts: string[] = [];
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "__hr_bg_scripts") {
    backgroundScripts = msg.scripts;
  }
});

chrome.management.getSelf(async (self) => {
  if (self.installType === "development") {
    chrome.runtime.getPackageDirectoryEntry(watchChanges);

    // NB: see https://github.com/xpl/crx-hotreload/issues/5
    const { [RELOAD_TAB_FLAG]: reloadTabURL } =
      await chrome.storage.local.get(RELOAD_TAB_FLAG);

    if (reloadTabURL) {
      await chrome.storage.local.remove(RELOAD_TAB_FLAG);

      queryTabs({ url: reloadTabURL }).then((tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.reload(tabs[0].id!);
        } else {
          chrome.tabs.create({ url: reloadTabURL, active: true });
        }
      });
    }
  }
});

async function watchChanges(
  dir: DirectoryEntry,
  lastChecksum?: ChecksumSnapshot,
  lastChangedAt = Date.now(),
) {
  const entities = await findFiles(dir);

  const checksum: ChecksumSnapshot = {
    common: toChecksum(entities),
    background: toChecksum(entities.filter((e) => e.insideBackground)),
    content: toChecksum(entities.filter((e) => e.insideContent)),
    locales: toChecksum(entities.filter((e) => e.locale)),
    manifest: toChecksum(
      entities.filter((e) => e.file.name === "manifest.json"),
    ),
  };

  if (lastChecksum && checksum.common !== lastChecksum.common) {
    try {
      if (
        checksum.content !== lastChecksum.content ||
        checksum.locales !== lastChecksum.locales ||
        checksum.manifest !== lastChecksum.manifest ||
        checksum.background !== lastChecksum.background
      ) {
        const activeTab = await getActiveMainTab();
        if (activeTab?.url)
          await chrome.storage.local.set({ [RELOAD_TAB_FLAG]: activeTab.url });

        chrome.runtime.reload();
      } else {
        const tabs = await queryTabs({
          url: getExtensionUrlPattern(),
        });

        // Reload extension tabs
        for (const tab of tabs) {
          if (tab.url?.includes("hotreload")) continue;

          chrome.tabs.reload(tab.id!);
        }
        // Reload popup
        chrome.extension.getViews({ type: "popup" }).forEach((popupWindow) => {
          popupWindow.location.reload();
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      lastChangedAt = Date.now();
    }
  }

  const retryAfter =
    Date.now() - lastChangedAt > SLOW_DOWN_AFTER ? 5_000 : 1_000;
  setTimeout(() => watchChanges(dir, checksum, lastChangedAt), retryAfter);
}

function findFiles(dir: DirectoryEntry) {
  return new Promise<FileEntity[]>((resolve) => {
    dir.createReader().readEntries((entries) => {
      Promise.all(
        entries
          .filter((entry) => entry.name[0] !== ".")
          .map((entry) =>
            entry.isDirectory
              ? findFiles(entry as DirectoryEntry)
              : new Promise((res) =>
                  (entry as FileEntry).file((file) => {
                    const insideBackground = isEntryInside(
                      entry,
                      backgroundScripts,
                    );
                    const insideContent = isEntryInside(entry, contentScripts);
                    const locale = /.*\_locales.*\.json/.test(entry.fullPath);
                    res({ file, insideBackground, insideContent, locale });
                  }),
                ),
          ),
      )
        .then((entities: any[]) => [].concat(...entities))
        .then(resolve);
    });
  });
}

function toChecksum(entities: FileEntity[]) {
  return entities.map(({ file }) => `${file.name}${file.lastModified}`).join();
}

function isEntryInside(entry: Entry, paths: string[]) {
  return paths.some((p) => entry.fullPath.endsWith(p));
}

function getStaticContentScripts() {
  const manifest = chrome.runtime.getManifest();
  const scriptSet = new Set<string>();

  if (manifest.web_accessible_resources) {
    for (const resource of manifest.web_accessible_resources) {
      if (typeof resource === "string") {
        scriptSet.add(resource);
      } else {
        resource.resources.forEach((r) => scriptSet.add(r));
      }
    }
  }

  if (manifest.content_scripts) {
    for (const contentScript of manifest.content_scripts) {
      if (contentScript.js) {
        for (const s of contentScript.js) {
          scriptSet.add(s);
        }
      }
    }
  }

  return Array.from(scriptSet);
}

async function scheduleContentScriptsUpdate() {
  const registered = await chrome.scripting
    .getRegisteredContentScripts()
    .catch(() => []);

  const scriptSet = new Set(contentScripts);

  for (const { js } of registered) {
    js?.forEach((s) => scriptSet.add(s));
  }

  contentScripts = Array.from(scriptSet);

  setTimeout(scheduleContentScriptsUpdate, 5_000);
}

async function getActiveMainTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await queryTabs({
    active: true,
    lastFocusedWindow: true,
    url: getExtensionUrlPattern("main.html"),
  });
  return tabs[0];
}

function queryTabs(params: chrome.tabs.QueryInfo) {
  return new Promise<chrome.tabs.Tab[]>((res) =>
    chrome.tabs.query(params, res),
  );
}

function getExtensionUrlPattern(path = "**") {
  return `chrome-extension://${chrome.runtime.id}/${path}`;
}
