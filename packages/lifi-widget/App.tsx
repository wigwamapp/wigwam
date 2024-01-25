import { forwardRef, useEffect, useMemo } from 'react';
import type { WidgetDrawer } from './AppDrawer';
import { AppDrawer } from './AppDrawer';
import { AppProvider } from './AppProvider';
import { AppRoutes } from './AppRoutes';
import {
  AppContainer,
  AppExpandedContainer,
  FlexContainer,
} from './components/AppContainer';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWatch } from 'react-hook-form';

import { Header } from './components/Header';
import { Initializer } from './components/Initializer';
import { PoweredBy } from './components/PoweredBy';
import { RoutesExpanded } from './components/Routes';
import { TransactionHistoryPageExpanded } from './pages/TransactionHistoryPage/TransactionHistoryPageExpanded';
import { TransactionDetailsPageExpanded } from './pages/TransactionDetailsPage/TransactionDetailsPageExpanded';
import { SettingsPageExpanded } from './pages/SettingsPage/SettingsPageExpanded';
import { TransactionPageExpanded } from './pages/TransactionPage/TransactionPageExpanded'
import { useExpandableVariant } from './hooks';
import { useWidgetConfig, FormKey } from './providers';
import type { WidgetConfig, WidgetProps } from './types';
import { ElementId, createElementId } from './utils';


import './override.css';

export const App = forwardRef<WidgetDrawer, WidgetProps>(
  ({ elementRef, open, integrator, ...other }, ref) => {
    const config: WidgetConfig = useMemo(
      () => ({ integrator, ...other, ...other.config }),
      [integrator, other],
    );
    return config?.variant !== 'drawer' ? (
      <AppProvider config={config}>
        <AppDefault />
      </AppProvider>
    ) : (
      <AppDrawer
        ref={ref}
        elementRef={elementRef}
        integrator={integrator}
        config={config}
        open={open}
      />
    );
  },
);

export const AppDefault = () => {
  const { elementId } = useWidgetConfig();
  const expandable = useExpandableVariant();
  const location = useLocation();
  const navigate = useNavigate();

  const [fromToken, toToken, fromAmount] = useWatch({
    name: [FormKey.FromToken, FormKey.ToToken, FormKey.FromAmount],
  });

  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      navigate('/')
    }
  }, [fromToken, toToken, fromAmount])

  return (
    <AppExpandedContainer
      id={createElementId(ElementId.AppExpandedContainer, elementId)}
    >
      <AppContainer>
        <Header />
        <FlexContainer disableGutters>
          <AppRoutes />
        </FlexContainer>
        <PoweredBy />
        <Initializer />
      </AppContainer>
      {(expandable && !location.search.includes("settings") && !location.search.includes("transactionProcessing") && !location.search.includes("transactionHistory") && !location.search.includes("transactionDetails")) ?  <RoutesExpanded /> : null}
      {(expandable && location.search.includes("transactionHistory")) ? <TransactionHistoryPageExpanded /> : null}
      {(expandable && location.search.includes("transactionDetails")) ? <TransactionDetailsPageExpanded /> : null}
      {(expandable && location.search.includes("settings")) ? <SettingsPageExpanded /> : null}
      {(expandable && location.search.includes("transactionProcessing")) ? <TransactionPageExpanded /> : null}
    </AppExpandedContainer>
  );
};
