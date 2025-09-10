import { porter } from "core/client";
import { PorterChannel } from "core/types";
import { autoDisconnectPort } from "lib/ext/porter/autoDisconnect";

import { mount } from "app/root";
import PopupApp from "app/components/PopupApp";

porter.connect(PorterChannel.Wallet);
autoDisconnectPort(porter);

mount(<PopupApp />);
