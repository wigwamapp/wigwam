import { FC, Suspense } from "react";
import { LocationProvider } from "woozie";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { QUERY_CLIENT, FONTS } from "app/defaults";
import ErrBond from "app/components/layouts/ErrBond";
import {
  AwaitFonts,
  AwaitI18N,
  UpdateWalletStatus,
} from "app/components/daemons";

const BaseProvider: FC = ({ children }) => (
  <LocationProvider>
    <QueryClientProvider client={QUERY_CLIENT}>
      <>
        <ErrBond>
          <Suspense fallback={null}>
            <AwaitFonts fonts={FONTS} />
            <AwaitI18N />
            <UpdateWalletStatus />

            {children}
          </Suspense>
        </ErrBond>

        <ReactQueryDevtools />
      </>
    </QueryClientProvider>
  </LocationProvider>
);

export default BaseProvider;
