import BigNumber from "bignumber.js";
import { initProfiles } from "lib/ext/profile";
import { setupArgon2Impl } from "lib/kdbx";

import { setupFixtures } from "core/repo";
import {
  startWalletServer,
  startPageServer,
  startBruteForceProtection,
  startInstallOrUpdateListener,
  startApproveWindowOpener,
  startTxObserver,
  startExtBadge,
  startAutoLocker,
} from "core/back/services";

BigNumber.set({ EXPONENTIAL_AT: 38 });

setupArgon2Impl();

// Init profiles
// - Create default profile if it doesn't exist
// - Open new tab when profile changed (after refresh)
initProfiles();

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
