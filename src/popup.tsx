import { porter } from "core/client";
import { PorterChannel } from "core/types";

import { mount } from "app/root";
import PopupApp from "app/components/PopupApp";

porter.connect(PorterChannel.Wallet);

mount(<PopupApp />);
