import { PorterClient } from "lib/ext/porter/client";

import { Request, Response } from "core/types";

export const porter = new PorterClient<Request, Response>();
