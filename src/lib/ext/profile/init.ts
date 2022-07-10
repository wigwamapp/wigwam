import { fetchStateForce, setState } from "./state";
import { generateProfile } from "./helpers";
import { DEFAULT_NAME } from "./defaults";

export async function initProfiles() {
  const state = await fetchStateForce();
  if (!state) {
    const current = generateProfile(DEFAULT_NAME);
    const all = [current];

    await setState({ all, currentId: current.id });
  }
}
