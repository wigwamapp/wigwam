import { expose } from "threads/worker";
import { notifyWorkerSpawned } from "lib/ext/worker";

import * as Provider from "./provider";

notifyWorkerSpawned();
expose(Provider);
