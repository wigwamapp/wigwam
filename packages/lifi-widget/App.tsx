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
import { useLocation } from 'react-router-dom';

import { Header } from './components/Header';
import { Initializer } from './components/Initializer';
import { PoweredBy } from './components/PoweredBy';
import { RoutesExpanded } from './components/Routes';
import { TransactionHistoryPageExpanded } from './pages/TransactionHistoryPage/TransactionHistoryPageExpanded';
import { TransactionDetailsPageExpanded } from './pages/TransactionDetailsPage/TransactionDetailsPageExpanded';
import { SettingsPageExpanded } from './pages/SettingsPage/SettingsPageExpanded';
import { TransactionPageExpanded } from './pages/TransactionPage/TransactionPageExpanded'
import { useExpandableVariant } from './hooks';
import { useWidgetConfig } from './providers';
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
      {(expandable && !location.search.includes("transactionProcessing")) ?  <RoutesExpanded /> : null}
      {(expandable && location.search.includes("transactionHistory")) ? <TransactionHistoryPageExpanded /> : null}
      {(expandable && location.search.includes("transactionDetails")) ? <TransactionDetailsPageExpanded /> : null}
      {(expandable && location.search.includes("settings")) ? <SettingsPageExpanded /> : null}
      {(expandable && location.search.includes("transactionProcessing")) ? <TransactionPageExpanded /> : null}
    </AppExpandedContainer>
  );
};
