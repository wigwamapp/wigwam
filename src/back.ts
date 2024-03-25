import "lib/shims/axiosFetchAdapter";
import "lib/shims/bignumberLimit";

import { setupArgon2Impl } from "lib/kdbx/argon";
import { initProfiles } from "lib/ext/profile";
import { openIfWasRestarted } from "lib/ext/utils";

import { setupFixtures } from "core/repo";
import {
  startInpageContentScript,
  startWalletServer,
  startPageServer,
  startBruteForceProtection,
  startInstallOrUpdateListener,
  startApproveWindowOpener,
  startPersistingApprovals,
  startTxObserver,
  startExtBadge,
  startAutoLocker,
  startRampTxObserver,
  startAutoNetworkChanger,
} from "core/back/services";

setupArgon2Impl();
startInpageContentScript();

// Init profiles
// - Create default profile if it doesn't exist
// - Open new tab when profile changed (after refresh)
initProfiles();
openIfWasRestarted();

// Merge default data to the device storage
setupFixtures();

// Start background server
// It starts Porter server to communicate with UI & content scripts
startWalletServer();
startPageServer();

startApproveWindowOpener();
startPersistingApprovals();
startTxObserver();
startRampTxObserver();
startExtBadge();

startInstallOrUpdateListener();

startAutoLocker();
startBruteForceProtection();
startAutoNetworkChanger();
