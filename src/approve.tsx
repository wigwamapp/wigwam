import { porter } from "core/client";
import { PorterChannel } from "core/types";

import { mount } from "app/root";
import ApproveApp from "app/components/ApproveApp";

porter.connect(PorterChannel.Wallet);

mount(<ApproveApp />);
