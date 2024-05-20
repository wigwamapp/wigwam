/* eslint-disable react/no-array-index-key */
import { useEffect, useState } from 'react';
import type { Route } from '@lifi/sdk';
import { Collapse, Grow, Stack, Typography } from '@mui/material';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { useRoutes } from '../../hooks';
import { useWidgetConfig } from '../../providers';
import { useSetExecutableRoute } from '../../stores';
import { navigationRoutes, formatInputAmount } from '../../utils';

import { ProgressToNextUpdate } from '../ProgressToNextUpdate';
import { RouteCard, RouteCardSkeleton, RouteNotFoundCard } from '../RouteCard';
import { useController, useWatch } from 'react-hook-form';

import {
  CollapseContainer,
  Container,
  Header,
  ScrollableContainer,
} from './RoutesExpanded.style';

const timeout = { enter: 225, exit: 225, appear: 0 };

export const RoutesExpanded = () => {
  const element = useMatch('/');
  return (
    <CollapseContainer sx={{ overflowY: 'auto', scrollbarGutter: 'stable', overflowX: 'hidden', height: '100%', marginLeft: '0 !important'}}>
      <Collapse timeout={timeout} in={!!element} orientation="horizontal" sx={{height: '100%', marginLeft: '0 !important', borderRight: '1px solid #21262A'}}>
        <Grow timeout={timeout} in={!!element} mountOnEnter unmountOnExit style={{marginLeft: '0px'}}>
          <div style={{marginLeft: '0px'}}>
            <RoutesExpandedElement />
          </div>
        </Grow>
      </Collapse>
    </CollapseContainer>
  );
};

export const RoutesExpandedElement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    field: { onChange },
  } = useController({
    name: 'toAmount',
  });

  const setExecutableRoute = useSetExecutableRoute();
  const { subvariant, containerStyle } = useWidgetConfig();
  const { isValid, isValidating } = useFormState();
  const {
    routes,
    isLoading,
    isFetching,
    isFetched,
    dataUpdatedAt,
    refetchTime,
    refetch,
  } = useRoutes();


  const currentRoute = routes?.[0];

  const [selectedRouteId, setSelectedRouteId] = useState(currentRoute?.id || 0);

  useEffect(() => {
    if (currentRoute) {
      handleRouteClick(currentRoute)
    }
  }, [currentRoute])

  const handleRouteClick = (route: Route) => {
    if (isValid && !isValidating) {
      const formattedAmount = String(Number(route.toAmount)/Math.pow(10, route.toToken.decimals))
      onChange(formattedAmount)
      setExecutableRoute(route);
      setSelectedRouteId(route.id);
      // navigate(navigationRoutes.transactionExecution, {
      //   state: { routeId: route.id },
      // });
    }
  };

  const expanded = Boolean(
    currentRoute || isLoading || isFetching || isFetched,
  );

  const routeNotFound = !currentRoute && !isLoading && !isFetching && expanded;

  return (
    <Collapse timeout={timeout.enter} in={expanded} orientation="horizontal" style={{marginLeft: '0px'}}>
      <Grow timeout={timeout.enter} in={expanded} mountOnEnter unmountOnExit>
        <Container sx={{...containerStyle, width: '500px', marginLeft: '0px !important'}} enableColorScheme>
          <ScrollableContainer>
            <Header>
              <Typography fontSize={16} color={'#fff'} fontWeight="600" flex={1} noWrap>
                Choose a Route
              </Typography>
              <ProgressToNextUpdate
                updatedAt={dataUpdatedAt || new Date().getTime()}
                timeToUpdate={refetchTime}
                isLoading={isFetching}
                onClick={() => refetch()}
                sx={{ marginRight: -1 }}
              />
            </Header>
            <Stack
              direction="column"
              spacing={2}
              flex={1}
              paddingX={3}
              paddingBottom={3}
              height={'100%'}
            >
              {routeNotFound ? (
                <RouteNotFoundCard />
              ) : isLoading || (isFetching && !routes?.length) ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <RouteCardSkeleton key={index} />
                ))
              ) : (
                routes?.map((route: Route, index: number) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    onClick={() => handleRouteClick(route)}
                    active={route.id === selectedRouteId}
                    expanded={routes?.length <= 2}
                  />
                ))
              )}
            </Stack>
          </ScrollableContainer>
        </Container>
      </Grow>
    </Collapse>
  );
};
