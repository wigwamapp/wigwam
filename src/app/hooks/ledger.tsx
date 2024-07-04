import { useCallback, useRef } from "react";
import Transport from "@ledgerhq/hw-transport";
import retry from "async-retry";
import { Buffer } from "buffer";

import type LedgerEthType from "@ledgerhq/hw-app-eth";
import type { getExtendedKey as getExtendedKeyType } from "lib/ledger";

import { withHumanDelay } from "app/utils";
import { LoadingHandler, useDialog } from "app/hooks/dialog";

import { ReactComponent as LedgerConnect } from "app/icons/ledger-connect.svg";
import { ReactComponent as LedgerApp } from "app/icons/ledger-open-app.svg";

export type LedgerHandler = (
  params: {
    ledgerEth: LedgerEthType;
    getExtendedKey: typeof getExtendedKeyType;
    connectedApp: string;
  },
  onClose: (callback: () => void) => void,
) => Promise<any>;

export function useLedger() {
  const { waitLoading } = useDialog();

  const transportRef = useRef<Transport>();

  const loadingHandler = useCallback<
    LoadingHandler<LedgerHandler, "loading" | "connectApp">
  >(
    ({ params: ledgerHandler, onClose, setState }) =>
      withHumanDelay(async () => {
        try {
          let closed = false;
          let connectedApp = "";
          onClose(() => (closed = true));

          const [{ default: LedgerEth }, { LedgerTransport, getExtendedKey }] =
            await Promise.all([
              import("@ledgerhq/hw-app-eth"),
              import("lib/ledger"),
            ]);

          const connected = await retry(
            async () => {
              if (closed) return false;

              await transportRef.current?.close();
              transportRef.current = await LedgerTransport.create();

              onClose(() =>
                setTimeout(() => {
                  transportRef.current?.close();
                  transportRef.current = undefined;
                }),
              );

              if (process.env.TARGET_BROWSER === "chrome") {
                const { name: currentApp } = await getAppInfo(
                  transportRef.current,
                );
                connectedApp = currentApp;
                if (closed) return false;

                const supportedApps = ["Ethereum", "RSK"];

                if (!supportedApps.includes(currentApp)) {
                  if (currentApp !== "BOLOS") {
                    await disconnectFromConnectedApp(transportRef.current);
                    transportRef.current = await LedgerTransport.create();
                    await timeout(500);
                    if (closed) return false;
                  }

                  setState("connectApp");
                  await connectToEthereumApp(transportRef.current, currentApp);
                  transportRef.current = await LedgerTransport.create();
                  await timeout(500);
                  if (closed) return false;
                  setState("loading");
                }
              }

              return true;
            },
            { retries: 5, maxTimeout: 2_000 },
          );

          if (!connected || !transportRef.current) return false;

          const ledgerEth = new LedgerEth(transportRef.current!);
          await ledgerHandler(
            { ledgerEth, getExtendedKey, connectedApp },
            onClose,
          );

          return !closed;
        } catch (err: any) {
          const msg = err?.message ?? "Unknown error";

          if (msg === "user closed popup") return false;

          throw new Error(msg);
        }
      }),
    [],
  );

  return useCallback(
    (handler: LedgerHandler) =>
      waitLoading({
        title: "Loading...",
        headerClassName: "mb-3",
        content: (state: "loading" | "connectApp") => (
          <>
            {state === "loading" ? (
              <LedgerConnect className="h-[3.125rem] w-auto" />
            ) : (
              <LedgerApp className="h-[3.125rem] w-auto" />
            )}
            <span className="mt-8">
              {state === "connectApp"
                ? "Open the Ethereum or RSK app on your device."
                : process.env.TARGET_BROWSER === "chrome"
                  ? "Connect and unlock your device."
                  : "Connect, unlock your device, and open the Ethereum or RSK app."}
            </span>
          </>
        ),
        loadingHandler,
        handlerParams: handler,
        state: "loading",
      }),
    [loadingHandler, waitLoading],
  );
}

const getAppInfo = async (
  transport: Transport,
): Promise<{
  name: string;
  version: string;
  flags: number | Buffer;
}> => {
  const r = await transport.send(0xb0, 0x01, 0x00, 0x00);
  let i = 0;
  const format = r[i++];

  if (format !== 1) {
    throw new Error("getAppAndVersion: format not supported");
  }

  const nameLength = r[i++];
  const name = r.slice(i, (i += nameLength)).toString("ascii");
  const versionLength = r[i++];
  const version = r.slice(i, (i += versionLength)).toString("ascii");
  const flagLength = r[i++];
  const flags = r.slice(i, (i += flagLength));
  return {
    name,
    version,
    flags,
  };
};

const connectToEthereumApp = async (
  transport: Transport,
  app: string,
): Promise<void> => {
  await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(app, "ascii"));
};

const disconnectFromConnectedApp = async (
  transport: Transport,
): Promise<void> => {
  await transport.send(0xb0, 0xa7, 0x00, 0x00);
};

const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
