import { porter } from "core/client";
import { PorterChannel } from "core/types";

import { mount } from "app/root";
import ConfirmApp from "app/components/ConfirmApp";

porter.connect(PorterChannel.Wallet);

mount(<ConfirmApp />);
