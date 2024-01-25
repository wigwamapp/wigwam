/* eslint-disable react/no-array-index-key */
import { useState } from 'react';
import type { Route } from '@lifi/sdk';
import { Collapse, Grow, Stack, Typography } from '@mui/material';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { useRoutes } from '../../hooks';
import { useWidgetConfig } from '../../providers';
import { useSetExecutableRoute } from '../../stores';
import { navigationRoutes, formatInputAmount } from '../../utils';
import { TransactionHistoryPage } from './TransactionHistoryPage';
// import { ProgressToNextUpdate } from '../ProgressToNextUpdate';
// import { RouteCard, RouteCardSkeleton, RouteNotFoundCard } from '../RouteCard';
import { useController, useWatch } from 'react-hook-form';

import {
  CollapseContainer,
  Container,
  Header,
  ScrollableContainer,
} from '../../components/Routes/RoutesExpanded.style';

const timeout = { enter: 225, exit: 225, appear: 0 };

export const TransactionHistoryPageExpanded = () => {
  const element = useMatch('/');
  return (
    <CollapseContainer sx={{ overflowY: 'auto', scrollbarGutter: 'stable', overflowX: 'hidden', height: '100%'}}>
      <Collapse timeout={timeout} in={!!element} orientation="horizontal" sx={{height: '100%'}}>
        <Grow timeout={timeout} in={!!element} mountOnEnter unmountOnExit>
          <div style={{height: '100%'}}>
            <TransactionHistoryPage />
          </div>
        </Grow>
      </Collapse>
    </CollapseContainer>
  );
};

// export const RoutesExpandedElement = () => {
//   const { t } = useTranslation();
//   const navigate = useNavigate();

//   const {
//     field: { onChange },
//   } = useController({
//     name: 'toAmount',
//   });

//   const setExecutableRoute = useSetExecutableRoute();
//   const { subvariant, containerStyle } = useWidgetConfig();
//   const { isValid, isValidating } = useFormState();
//   const {
//     routes,
//     isLoading,
//     isFetching,
//     isFetched,
//     dataUpdatedAt,
//     refetchTime,
//     refetch,
//   } = useRoutes();


//   const currentRoute = routes?.[0];

//   const [selectedRouteId, setSelectedRouteId] = useState(currentRoute?.id || 0);

//   const handleRouteClick = (route: Route) => {
//     if (isValid && !isValidating) {
//       setExecutableRoute(route);
//       setSelectedRouteId(route.id);
//       console.log('route', route)
//       const formattedAmount = String(Number(route.toAmount)/Math.pow(10, route.toToken.decimals))
//       onChange(formattedAmount)
//       // navigate(navigationRoutes.transactionExecution, {
//       //   state: { routeId: route.id },
//       // });
//     }
//   };

//   const expanded = Boolean(
//     currentRoute || isLoading || isFetching || isFetched,
//   );

//   const routeNotFound = !currentRoute && !isLoading && !isFetching && expanded;

//   return (
//     <Collapse timeout={timeout.enter} in={expanded} orientation="horizontal">
//       <Grow timeout={timeout.enter} in={expanded} mountOnEnter unmountOnExit>
//         <Container sx={containerStyle} enableColorScheme>
//           <ScrollableContainer>
//             <Header>
//               <Typography fontSize={18} fontWeight="700" flex={1} noWrap>
//                 {subvariant === 'nft'
//                   ? t('main.fromAmount')
//                   : t('header.youGet')}
//               </Typography>
//               <ProgressToNextUpdate
//                 updatedAt={dataUpdatedAt || new Date().getTime()}
//                 timeToUpdate={refetchTime}
//                 isLoading={isFetching}
//                 onClick={() => refetch()}
//                 sx={{ marginRight: -1 }}
//               />
//             </Header>
//             <Stack
//               direction="column"
//               spacing={2}
//               flex={1}
//               paddingX={3}
//               paddingBottom={3}
//             >
//               {routeNotFound ? (
//                 <RouteNotFoundCard />
//               ) : isLoading || (isFetching && !routes?.length) ? (
//                 Array.from({ length: 3 }).map((_, index) => (
//                   <RouteCardSkeleton key={index} />
//                 ))
//               ) : (
//                 routes?.map((route: Route, index: number) => (
//                   <RouteCard
//                     key={route.id}
//                     route={route}
//                     onClick={() => handleRouteClick(route)}
//                     active={route.id === selectedRouteId}
//                     expanded={routes?.length <= 2}
//                   />
//                 ))
//               )}
//             </Stack>
//           </ScrollableContainer>
//         </Container>
//       </Grow>
//     </Collapse>
//   );
// };
