type FileEntity = {
  file: File;
  insideBackground: boolean;
  insideContent: boolean;
};

type ChecksumSnapshot = {
  common: string;
  background: string;
  content: string;
};

const RELOAD_TAB_FLAG = "__hr_reload_tab";
const SLOW_DOWN_AFTER = 5 * 60_000; // 5 min

const backgroundScripts = getBackgroundScripts();
const contentScripts = getContentScripts();

chrome.management.getSelf((self) => {
  if (self.installType === "development") {
    chrome.runtime.getPackageDirectoryEntry(watchChanges);

    // NB: see https://github.com/xpl/crx-hotreload/issues/5
    if (localStorage.getItem(RELOAD_TAB_FLAG)) {
      localStorage.removeItem(RELOAD_TAB_FLAG);

      getActiveTab().then((tab) => {
        if (tab) {
          chrome.tabs.reload(tab.id!);
        }
      });
    }
  }
});

async function watchChanges(
  dir: DirectoryEntry,
  lastChecksum?: ChecksumSnapshot,
  lastChangedAt = Date.now()
) {
  const entities = await findFiles(dir);

  const checksum: ChecksumSnapshot = {
    common: toChecksum(entities),
    background: toChecksum(entities.filter((e) => e.insideBackground)),
    content: toChecksum(entities.filter((e) => e.insideContent)),
  };

  if (lastChecksum && checksum.common !== lastChecksum.common) {
    if (checksum.content !== lastChecksum.content) {
      localStorage.setItem(RELOAD_TAB_FLAG, "true");
      chrome.runtime.reload();
    } else {
      let activeTab: chrome.tabs.Tab | undefined;

      if (checksum.background !== lastChecksum.background) {
        // Reload background script
        location.reload();
        activeTab = await getActiveTab();
      }

      chrome.tabs.query(
        { url: `chrome-extension://${chrome.runtime.id}/**` },
        (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.reload(tab.id!);
          }
          if (activeTab) {
            chrome.tabs.reload(activeTab.id!);
          }
        }
      );
    }

    lastChangedAt = Date.now();
  }

  const retryAfter =
    Date.now() - lastChangedAt > SLOW_DOWN_AFTER ? 10_000 : 1_000;
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
                      backgroundScripts
                    );
                    const insideContent = isEntryInside(entry, contentScripts);
                    res({ file, insideBackground, insideContent });
                  })
                )
          )
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

function getBackgroundScripts() {
  return Array.from(document.scripts).map(
    (s) => s.src.split(chrome.runtime.id)[1]
  );
}

function getContentScripts() {
  const manifest = chrome.runtime.getManifest();
  const paths = [];
  if (manifest.content_scripts) {
    for (const contentScript of manifest.content_scripts) {
      if (contentScript.js) {
        for (const path of contentScript.js) {
          paths.push(path);
        }
      }
    }
  }
  return paths;
}

function getActiveTab() {
  return new Promise<chrome.tabs.Tab | undefined>((res) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      res(tabs[0]);
    });
  });
}
