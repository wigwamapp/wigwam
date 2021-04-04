import React, { Suspense } from "react";
import { LocationProvider } from "woozie";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";
import { QUERY_CLIENT, FONTS } from "app/defaults";
import ErrBond from "app/components/layout/ErrBond";
import { AwaitFonts, UpdateWalletState } from "app/components/daemons";
import PageRouter from "app/components/PageRouter";

const App: React.FC = () => (
  <LocationProvider>
    <QueryClientProvider client={QUERY_CLIENT}>
      <>
        <ErrBond>
          <Suspense fallback={null}>
            <AwaitFonts fonts={FONTS} />
            <UpdateWalletState />

            <PageRouter />
          </Suspense>
        </ErrBond>

        <Toaster />
        <ReactQueryDevtools />
      </>
    </QueryClientProvider>
  </LocationProvider>
);

export default App;
