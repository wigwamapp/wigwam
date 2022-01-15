import { expose } from "lib/web-worker/worker";

import { hash, verify } from "argon2-browser";

expose({ hash, verify });
