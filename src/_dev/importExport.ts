import { downloadFile } from "lib/download";
import { changeProfile } from "lib/ext/profile";

import { exportCurrentProfile, importProfile } from "core/common/importExport";

export async function downloadCurrentProfile() {
  const { name, blob } = await exportCurrentProfile();

  await downloadFile(blob, `${name}.wigwam`);
}

export async function uploadProfile() {
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
  uploadField.accept = ".wigwam";
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
          changeProfile(p.id);
        })
        .catch((err) => alert(err.message));
    }
  };
}
