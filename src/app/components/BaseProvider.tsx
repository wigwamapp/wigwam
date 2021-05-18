import { Suspense } from "react";
import { LocationProvider } from "woozie";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { QUERY_CLIENT, FONTS } from "app/defaults";
import ErrBond from "app/components/layouts/ErrBond";
import { AwaitFonts, UpdateWalletStatus } from "app/components/daemons";

const BaseProvider: React.FC = ({ children }) => (
  <LocationProvider>
    <QueryClientProvider client={QUERY_CLIENT}>
      <>
        <ErrBond>
          <Suspense fallback={null}>
            <AwaitFonts fonts={FONTS} />
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
