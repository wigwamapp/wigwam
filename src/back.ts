import "lib/shims/axiosFetchAdapter";
import "lib/shims/bignumberLimit";

import { setupArgon2Impl } from "lib/kdbx";
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
  startTxObserver,
  startExtBadge,
  startAutoLocker,
} from "core/back/services";

setupArgon2Impl();
startInpageContentScript();

// Init profiles
// - Create default profile if it doesn't exist
// - Open new tab when profile changed (after refresh)
initProfiles();
openIfWasRestarted();

// Setup fixtures
setupFixtures();

// Start background server
// It starts Porter server to communicate with UI & content scripts
startWalletServer();
startPageServer();

// Start brute force protection
startBruteForceProtection();

startInstallOrUpdateListener();
startApproveWindowOpener();
startTxObserver();
startExtBadge();
startAutoLocker();
