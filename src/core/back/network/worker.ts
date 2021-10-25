import { expose } from "threads/worker";

import * as Provider from "./provider";

expose(Provider);
