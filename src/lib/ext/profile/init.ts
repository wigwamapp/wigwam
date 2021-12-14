import browser from "webextension-polyfill";

import { getMainURL } from "../utils";

import { fetchState, setState } from "./state";
import { generateProfile } from "./helpers";
import { DEFAULT_NAME } from "./defaults";

export async function initProfiles() {
  const state = await fetchState();
  if (!state) {
    const current = generateProfile(DEFAULT_NAME);
    const all = [current];

    await setState({ all, currentId: current.id });
  } else if (state.openTab) {
    await setState({ ...state, openTab: false });

    browser.tabs.create({
      url: getMainURL(),
      active: true,
    });
  }
}
