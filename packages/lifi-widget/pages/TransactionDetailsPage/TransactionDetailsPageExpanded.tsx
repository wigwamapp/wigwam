import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { Card, CardTitle } from '../../components/Card';
import { ContractComponent } from '../../components/ContractComponent';
import { Dialog } from '../../components/Dialog';
import { Insurance } from '../../components/Insurance';
import { getStepList } from '../../components/Step';
import { useNavigateBack, useRouteExecution } from '../../hooks';
import { useWidgetConfig } from '../../providers';
import { useHeaderStoreContext, useRouteExecutionStore } from '../../stores';
import { formatTokenAmount } from '../../utils';
import { ContactSupportButton } from './ContactSupportButton';
import { Container } from './TransactionDetailsPage.style';
import { RouteExecutionStatus } from '../../stores/routes/types';

export const TransactionDetailsPageExpanded: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { navigateBack } = useNavigateBack();
  const navigate = useNavigate();
  const { subvariant, contractComponent, contractSecondaryComponent } =
    useWidgetConfig();
  const { state, pathname }: any = useLocation();
  const [routeExecution, deleteRoute] = useRouteExecutionStore(
    (store) => [store.routes[state?.routeId], store.deleteRoute],
    shallow,
  );
  const headerStoreContext = useHeaderStoreContext();
  const [open, setOpen] = useState(false);

  const { restartRoute } = useRouteExecution({
    routeId: state?.routeId,
  });

  const toggleDialog = useCallback(() => {
    setOpen((open) => !open);
  }, []);

  const handleDeleteRoute = () => {
    navigateBack();
    if (routeExecution) {
      deleteRoute(routeExecution.route.id);
    }
  };

  const handleRestart = () => {
    if (routeExecution) {
      navigate(`${pathname}?tab=transactionProcessing`, {
        state: { routeId: routeExecution.route.id },
      });

      restartRoute()
    }
    
    // restartRoute()
  }

  const sourceTxHash = routeExecution?.route.steps[0].execution?.process
    .filter((process) => process.type !== 'TOKEN_ALLOWANCE')
    .find((process) => process.txHash)?.txHash;

  const insuranceCoverageId = sourceTxHash ?? routeExecution?.route.fromAddress;

  let supportId = sourceTxHash ?? routeExecution?.route.id ?? '';

  if (process.env.NODE_ENV === 'development') {
    supportId += `_${routeExecution?.route.id}`;
  }

  const [copied, setCopied] = useState(false);

  const copySupportId = async () => {
    await navigator.clipboard.writeText(supportId);
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 3000)
  };

  useEffect(() => {
    return headerStoreContext.getState().setAction(
      <IconButton size="medium" edge="end" onClick={toggleDialog}>
        <DeleteIcon />
      </IconButton>,
    );
  }, [headerStoreContext, toggleDialog]);

  const startedAt = new Date(
    routeExecution?.route.steps[0].execution?.process[0].startedAt ?? 0,
  );

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

  return (
    <Container sx={{width: '500px', position: 'relative', marginLeft: '0px', paddingTop: '0', maxHeight: '100%', overflowX: 'hidden', borderRight: '1px solid #21262A'}}>
      <div style={{display: 'flex', width: '460px', justifyContent: 'space-between', paddingTop: '12px', alignItems: 'center', marginBottom: '30px', position: 'sticky', top: '-1px', paddingBottom: '10px', zIndex: '10', background: '#181a1f', marginTop: '-1px'}}>
          <Typography color={'#fff'} fontSize={16} sx={{fontWeight: '600 !important'}}>Transaction info</Typography>
          <div onClick={() => navigateBack()} style={{cursor: 'pointer'}} className='closeButtonWrapper'>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M0.292893 1.11711C0.683417 0.726588 1.31658 0.726588 1.70711 1.11711L6 5.41001L10.2929 1.11711C10.6834 0.726588 11.3166 0.726588 11.7071 1.11711C12.0976 1.50764 12.0976 2.1408 11.7071 2.53133L7.41421 6.82422L11.7071 11.1171C12.0976 11.5076 12.0976 12.1408 11.7071 12.5313C11.3166 12.9219 10.6834 12.9219 10.2929 12.5313L6 8.23843L1.70711 12.5313C1.31658 12.9219 0.683417 12.9219 0.292893 12.5313C-0.0976311 12.1408 -0.0976311 11.5076 0.292893 11.1171L4.58579 6.82422L0.292893 2.53133C-0.0976311 2.1408 -0.0976311 1.50764 0.292893 1.11711Z" fill="white"/>
          </svg>
          </div>
      </div>
      <Card sx={{
          background: '#22262A',
          padding: '16px',
          border: 'none',
          marginTop: '14px'
      }} className='withHoverGray'>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        pb={1}
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
          routeExecution ?  <div style={{marginLeft: 'auto'}}>{getTxStatus(routeExecution?.status)}</div> : null
        }
      </Box>
      <div className="txSteps">
        {getStepList(routeExecution?.route, subvariant)}
      </div>
      {subvariant === 'nft' ? (
        <ContractComponent mt={2}>
          {contractSecondaryComponent || contractComponent}
        </ContractComponent>
      ) : null}
      {routeExecution?.route?.insurance?.state === 'INSURED' ? (
        <Insurance
          mt={2}
          status={routeExecution.status}
          feeAmountUsd={routeExecution.route.insurance.feeAmountUsd}
          insuredAmount={formatTokenAmount(
            routeExecution.route.toAmountMin,
            routeExecution.route.toToken.decimals,
          )}
          insuredTokenSymbol={routeExecution.route.toToken.symbol}
          insurableRouteId={routeExecution.route.id}
          insuranceCoverageId={insuranceCoverageId}
        />
      ) : null}
      <Card mt={2} sx={{background: 'transparent', border: 'none'}}>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
          }}
        >
          <CardTitle flex={1} fontSize={14}>{t('main.supportId')}</CardTitle>
          <Box className='withHover' onClick={copySupportId} mt={1} sx={{display: 'flex', cursor: 'pointer', justifyContent: 'center', alignItems: 'center', padding: '4px 8px', background: '#444955', borderRadius: '4px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
            <path d="M8.4 12.3242H1.2C0.537258 12.3242 0 11.787 0 11.1242V3.92422H1.2V11.1242H8.4V12.3242ZM10.8 9.92422H3.6C2.93726 9.92422 2.4 9.38696 2.4 8.72422V1.52422C2.4 0.861477 2.93726 0.324219 3.6 0.324219H10.8C11.4627 0.324219 12 0.861477 12 1.52422V8.72422C12 9.38696 11.4627 9.92422 10.8 9.92422ZM3.6 1.52422V8.72422H10.8V1.52422H3.6Z" fill="#F3F9F4"/>
          </svg>
            <Typography marginLeft={'10px'} fontSize={12} fontWeight={400} color={'#fff'}>{copied ? 'Copied' : 'Copy'}</Typography>
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{ wordBreak: 'break-all', background: '#181A1F', borderRadius: '10px', marginTop: '12px', border: '1px solid #272C30', padding: '12px 16px'}}
        >
          {supportId}
        </Typography>
      </Card>
      <Box mt={1}>
        <Typography
            variant="body2"
            pt={1}
            pb={2}
            px={2}
            sx={{ wordBreak: 'break-all' }}
          >
          Wigwam leverages the advanced Li.Fi swap functionality for seamless asset exchanges. If you require assistance, please use this support ID  and contact them through the link below.
        </Typography>
      </Box>
      <Box mt={1}>
        <ContactSupportButton supportId={supportId} />
        <Button sx={{borderRadius: '6px', width: '100%', marginTop: '8px'}} onClick={() => handleDeleteRoute()}>Remove</Button>
      </Box>
      </Card>
    </Container>
  );
};
