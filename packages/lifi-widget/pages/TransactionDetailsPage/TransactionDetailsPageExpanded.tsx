import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { Card, CardTitle } from '../../components/Card';
import { ContractComponent } from '../../components/ContractComponent';
import { Dialog } from '../../components/Dialog';
import { Insurance } from '../../components/Insurance';
import { getStepList } from '../../components/Step';
import { useNavigateBack } from '../../hooks';
import { useWidgetConfig } from '../../providers';
import { useHeaderStoreContext, useRouteExecutionStore } from '../../stores';
import { formatTokenAmount } from '../../utils';
import { ContactSupportButton } from './ContactSupportButton';
import { Container } from './TransactionDetailsPage.style';
import { RouteExecutionStatus } from '../../stores/routes/types';
import backIcon from '../../../../src/app/icons/back.svg';
import copyIcon from '../../../../src/app/icons/copy.svg';


export const TransactionDetailsPageExpanded: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { navigateBack } = useNavigateBack();
  const { subvariant, contractComponent, contractSecondaryComponent } =
    useWidgetConfig();
  const { state }: any = useLocation();
  const [routeExecution, deleteRoute] = useRouteExecutionStore(
    (store) => [store.routes[state?.routeId], store.deleteRoute],
    shallow,
  );
  const headerStoreContext = useHeaderStoreContext();
  const [open, setOpen] = useState(false);

  const toggleDialog = useCallback(() => {
    setOpen((open) => !open);
  }, []);

  const handleDeleteRoute = () => {
    navigateBack();
    if (routeExecution) {
      deleteRoute(routeExecution.route.id);
    }
  };

  const sourceTxHash = routeExecution?.route.steps[0].execution?.process
    .filter((process) => process.type !== 'TOKEN_ALLOWANCE')
    .find((process) => process.txHash)?.txHash;

  const insuranceCoverageId = sourceTxHash ?? routeExecution?.route.fromAddress;

  let supportId = sourceTxHash ?? routeExecution?.route.id ?? '';

  if (process.env.NODE_ENV === 'development') {
    supportId += `_${routeExecution?.route.id}`;
  }

  const copySupportId = async () => {
    await navigator.clipboard.writeText(supportId);
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
    <Container sx={{maxWidth: '500px !important'}}>
      <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '30px'}}>
        <div style={{display: 'flex'}}>
          <img style={{marginRight: '24px', cursor: 'pointer'}} src={backIcon} onClick={() => navigateBack()}/>
          <Typography color={'#fff'} fontSize={16} fontWeight={600}>Transaction info</Typography>
        </div>
      </div>
      <Card sx={{
          background: '#22262A',
          padding: '16px',
          border: 'none',
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
       <Typography fontSize={10} color="#fff">
        {formatDate(startedAt)} /&nbsp;
        </Typography>
        <Typography fontSize={10} color="#fff">
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
            <Typography marginLeft={'10px'} fontSize={12} fontWeight={400} color={'#fff'}>Copy</Typography>
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
      </Box>
      <Dialog open={open} onClose={toggleDialog}>
        <DialogTitle>{t('warning.title.deleteTransaction')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('warning.message.deleteTransactionHistory')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{t('button.cancel')}</Button>
          <Button variant="contained" onClick={handleDeleteRoute} autoFocus>
            {t('button.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      </Card>
    </Container>
  );
};
