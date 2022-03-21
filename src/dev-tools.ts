import browser from "webextension-polyfill";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Buffer } from "buffer";

import * as profile from "lib/ext/profile";
import * as global from "lib/ext/global";
import * as i18n from "lib/ext/i18n";
import { storage } from "lib/ext/storage";
import * as cryptoUtils from "lib/crypto-utils";

import * as types from "core/types";
import * as common from "core/common";
import * as repo from "core/repo";
import * as client from "core/client";

Object.assign(window, {
  ...cryptoUtils,
  browser,
  ethers,
  Buffer,
  profile,
  storage,
  global,
  i18n,
  types,
  common,
  repo,
  client,
  reset,
  getAllStorage,
  BigNumber,
});

async function reset() {
  global.clear();
  await storage.clear();
  await repo.clear();
  browser.runtime.reload();
}

function getAllStorage() {
  return browser.storage.local.get();
}

if (process.env.RELEASE_ENV === "false") {
  const downloadCurrentProfile = async () => {
    const { exportCurrentProfile } = await import("core/common/importExport");
    const { name, blob } = await exportCurrentProfile();

    const fileName = `${name}.vigvam`;
    const fileURL = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = fileURL;
    anchor.download = fileName;
    document.body.appendChild(anchor);

    setTimeout(() => {
      anchor.click();
      document.body.removeChild(anchor);

      setTimeout(() => URL.revokeObjectURL(anchor.href), 250);
    }, 66);
  };

  const uploadProfile = async () => {
    const { importProfile } = await import("core/common/importExport");

    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position: "fixed",
      zIndex: 9999,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(0, 0, 0, 0.90)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    const profileLabel = document.createElement("label");
    profileLabel.textContent = "Import profile";
    profileLabel.className = "font-semibold text-lg text-white mb-2";

    const uploadField = document.createElement("input");
    uploadField.type = "file";
    uploadField.accept = ".vigvam";
    uploadField.className = `mb-6 text-sm text-slate-500
    p-4 border border-white rounded-md cursor-pointer
    file:mr-4 file:py-2 file:px-4
    file:rounded-full file:border-0
    file:text-sm file:font-semibold
    file:bg-white file:text-violet-700
    file:cursor-pointer`;

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    Object.assign(closeButton.style, {
      padding: "0.5rem 1rem",
      color: "white",
      fontSize: "2rem",
    });
    closeButton.onclick = () => {
      document.body.removeChild(modal);
    };

    modal.appendChild(profileLabel);
    modal.appendChild(uploadField);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    uploadField.onchange = () => {
      const file = uploadField.files?.[0];
      if (file) {
        importProfile(file)
          .then((p) => {
            profile.changeProfile(p.id);
          })
          .catch((err) => alert(err.message));
      }
    };
  };

  Object.assign(window, {
    downloadCurrentProfile,
    uploadProfile,
  });
}
