/* eslint-disable react/no-array-index-key */
import type { Route } from '@lifi/sdk';
import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Token, TokenDivider } from '../../components/Token';
import { RouteExecutionStatus } from '../../stores/routes/types';
import {  useRouteExecution } from '../../hooks';

export const TransactionActiveItem: React.FC<{
  routeId: string,
}> = ({ routeId }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const { route, status, deleteRoute } = useRouteExecution({
    routeId,
    executeInBackground: true,
  });

  const handleClick = () => {
    if (route) {
      navigate('/?tab="transactionDetails"', {
        state: { routeId: route.id },
      });
    }
  };

  if (route && status) {
    const startedAt = new Date(
      route.steps[0].execution?.process[0].startedAt ?? 0,
    );
    const fromToken = { ...route.fromToken, amount: route.fromAmount };
    const toToken = {
      ...(route.steps.at(-1)?.execution?.toToken ?? route.toToken),
      amount: route.steps.at(-1)?.execution?.toAmount ?? route.toAmount,
    };
  
    const getTxStatus = (status: RouteExecutionStatus) => {
      switch (status) {
        case (RouteExecutionStatus.Done):
          return (
            <div className='txStatus complete'>Complete</div>
          )
        case (RouteExecutionStatus.Pending):
          return (
            <div className='txStatus progress'>In Progress...</div>
          )
        case (RouteExecutionStatus.Failed):
          return (
            <div className='txStatus failed'>Failed</div>
          )
      }
    }

    const formatDate = (date: any) => {
      return new Intl.DateTimeFormat(i18n.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    };
  
    const formatTime = (date: any) => {
      return new Intl.DateTimeFormat(i18n.language, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    };


    // useEffect(() => {
    //   console.log(status)
    //   if (status !== RouteExecutionStatus.Done) {
    //     const currentTime: Date = new Date();
    //     const timeDifference: number = currentTime.getTime() - startedAt.getTime();
    //     const hoursDifference: number = timeDifference / (1000 * 60 * 60);
    //     const isMoreThan2Hour: boolean = hoursDifference > 2;
    //     if (isMoreThan2Hour) {
    //       deleteRoute()
    //     }
    //   }
    // }, [])

    return (
      <Card 
        onClick={handleClick}
        className={'withHover'}
        sx={{borderRadius: '10px', background: '#22262A', border: `1px solid ${status === 4 ? 'rgb(234 85 106)' : '#ffcf26'}`}}>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          pt={1.75}
          px={2}
        >
          <div style={{display: 'flex'}}>
          <Typography fontSize={12} color="#fff">
            {formatDate(startedAt)} /&nbsp;
          </Typography>
          <Typography fontSize={12} color="#fff">
            {formatTime(startedAt)}
          </Typography>
          </div>
          {
            getTxStatus(status)
          }
        </Box>
        <Box py={1}>
          <Token token={fromToken} px={2} pt={1} connected/>
          {/* <TokenDivider /> */}
          <Token token={toToken} px={2} pb={1} sx={{marginTop: '16px'}} />
        </Box>
      </Card>
    );
  };

  
};
