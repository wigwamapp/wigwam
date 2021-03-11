type FileEntity = { entry: FileEntry; file: File };
type ChecksumSnapshot = {
  common: string;
  back: string;
  content: string;
};

chrome.management.getSelf((self) => {
  if (self.installType === "development") {
    chrome.runtime.getPackageDirectoryEntry((dir) => watchChanges(dir));

    // NB: see https://github.com/xpl/crx-hotreload/issues/5
    if (localStorage.getItem("__reload_tab")) {
      localStorage.removeItem("__reload_tab");
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id!);
        }
      });
    }
  }
});

async function watchChanges(
  dir: DirectoryEntry,
  lastChecksum?: ChecksumSnapshot
) {
  const entities = await filesInDirectory(dir);
  const { backgroundEntities, contentEntities } = findBackAndContentEntities(
    entities
  );
  const checksum: ChecksumSnapshot = {
    common: toChecksum(entities),
    back: toChecksum(backgroundEntities),
    content: toChecksum(contentEntities),
  };

  if (lastChecksum && checksum.common !== lastChecksum.common) {
    if (lastChecksum.content && checksum.content !== lastChecksum.content) {
      localStorage.setItem("__reload_tab", "true");
      chrome.runtime.reload();
    } else {
      if (lastChecksum.back && checksum.back !== lastChecksum.back) {
        // Reload background script
        location.reload();

        // TODO: Reload active tab.
      }

      chrome.tabs.query(
        { url: `chrome-extension://${chrome.runtime.id}/**` },
        (tabs) => {
          // NB: see https://github.com/xpl/crx-hotreload/issues/5
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.reload(tab.id);
            }
          }
        }
      );
    }
  }

  // retry after 1s
  setTimeout(() => watchChanges(dir, checksum), 1000);
}

function filesInDirectory(dir: DirectoryEntry) {
  return new Promise<FileEntity[]>((resolve) => {
    dir.createReader().readEntries((entries) => {
      Promise.all(
        entries
          .filter((entry) => entry.name[0] !== ".")
          .map((entry) =>
            entry.isDirectory
              ? filesInDirectory(entry as DirectoryEntry)
              : new Promise((res) =>
                  (entry as FileEntry).file((file) => {
                    res({ entry, file });
                  })
                )
          )
      )
        .then((files: any[]) => [].concat(...files))
        .then(resolve);
    });
  });
}

const bgScriptEntries = Array.from(document.scripts).map(
  (s) => s.src.split(chrome.runtime.id)[1]
);

const contentScriptEntries: string[] = [];
const manifest = chrome.runtime.getManifest();
if (manifest.content_scripts) {
  for (const contentScript of manifest.content_scripts) {
    if (contentScript.js) {
      for (const path of contentScript.js) {
        contentScriptEntries.push(path);
      }
    }
  }
}

function findBackAndContentEntities(entities: FileEntity[]) {
  const backgroundEntities: FileEntity[] = [];
  const contentEntities: FileEntity[] = [];

  for (const entity of entities) {
    if (bgScriptEntries.some((p) => entity.entry.fullPath.endsWith(p))) {
      backgroundEntities.push(entity);
    } else if (
      contentScriptEntries.some((p) => entity.entry.fullPath.endsWith(p))
    ) {
      contentEntities.push(entity);
    }
  }

  return { backgroundEntities, contentEntities };
}

function toChecksum(entities: FileEntity[]) {
  return entities.map(({ file }) => `${file.name}${file.lastModified}`).join();
}
