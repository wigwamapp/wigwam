import { expose } from "threads/worker";
import { notifyWorkerSpawned } from "lib/ext/worker";

import { hash, verify } from "argon2-browser";

notifyWorkerSpawned();
expose({ hash, verify });
