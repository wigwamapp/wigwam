import { porter } from "core/client";
import { PorterChannel } from "core/types";
import { autoDisconnectPort } from "lib/ext/porter/autoDisconnect";

import { mount } from "app/root";
import ApproveApp from "app/components/ApproveApp";

porter.connect(PorterChannel.Wallet);
autoDisconnectPort(porter);

mount(<ApproveApp />);
