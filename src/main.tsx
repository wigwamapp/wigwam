import { porter } from "core/client";
import { PorterChannel } from "core/types";

import { mount } from "app/root";
import MainApp from "app/components/MainApp";

porter.connect(PorterChannel.Wallet);

mount(<MainApp />);
