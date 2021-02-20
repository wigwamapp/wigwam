import React, { Suspense } from "react";
import { LocationProvider } from "woozie";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";
import { Toaster } from "react-hot-toast";
import { QUERY_CLIENT, FONTS } from "app/defaults";
import ErrBond from "app/components/a11y/ErrBond";
import AwaitFonts from "app/components/a11y/AwaitFonts";
import PageRouter from "app/components/PageRouter";

const App: React.FC = () => (
  <LocationProvider>
    <QueryClientProvider client={QUERY_CLIENT}>
      <>
        <ErrBond>
          <Suspense fallback={null}>
            <AwaitFonts fonts={FONTS} />

            <PageRouter />
          </Suspense>
        </ErrBond>

        <Toaster />

        {import.meta.env.SNOWPACK_PUBLIC_DEBUG === "true" && (
          <ReactQueryDevtools />
        )}
      </>
    </QueryClientProvider>
  </LocationProvider>
);

export default App;
