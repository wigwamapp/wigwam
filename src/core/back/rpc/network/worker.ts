import { expose } from "lib/web-worker/worker";

import * as Provider from "./provider";

expose(Provider);
