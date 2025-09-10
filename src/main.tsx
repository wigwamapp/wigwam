import { porter } from "core/client";
import { PorterChannel } from "core/types";
import { autoDisconnectPort } from "lib/ext/porter/autoDisconnect";

import { mount } from "app/root";
import MainApp from "app/components/MainApp";

porter.connect(PorterChannel.Wallet);
autoDisconnectPort(porter);

mount(<MainApp />);
