import type { ConfigUpdate } from '@lifi/sdk';
import { LiFi } from '@lifi/sdk';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { version } from '../../config/version';
import { useWidgetConfig } from '../WidgetProvider';

let lifi: LiFi;

interface SDKContextProps {
  lifi: LiFi;
  setFee: (newFee: number|undefined) => void; // Define the setter function for fee
}

const SDKContext = createContext<SDKContextProps>(null!);

export const useLiFi = (): SDKContextProps => useContext(SDKContext);

export const SDKProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const {
    sdkConfig,
    integrator,
    apiKey,
    referrer,
    routePriority,
    slippage,
  } = useWidgetConfig();

  const [currentFee, setCurrentFee] = useState<number|undefined>(undefined); // State for managing fee

  useEffect(() => {
    console.log('currentFee', currentFee)
  }, [currentFee])

  const value = useMemo(() => {
    console.log('GENERATE NEW CONFIG FOR LIFI')
    const config: ConfigUpdate = {
      ...sdkConfig,
      apiKey,
      integrator: integrator ?? window.location.hostname,
      defaultRouteOptions: {
        integrator: integrator ?? window.location.hostname,
        fee: currentFee, // Use the currentFee from state
        referrer,
        order: routePriority,
        slippage,
        ...sdkConfig?.defaultRouteOptions,
      },
    };
    if (!lifi) {
      lifi = new LiFi({
        disableVersionCheck: true,
        widgetVersion: version,
        ...config,
      });
    }
    lifi.setConfig(config);
    return { lifi, setFee: setCurrentFee }; // Expose the setter function
  }, [apiKey, currentFee, integrator, referrer, routePriority, sdkConfig, slippage]);

  return (
    <SDKContext.Provider value={value}>{children}</SDKContext.Provider>
  );
};
