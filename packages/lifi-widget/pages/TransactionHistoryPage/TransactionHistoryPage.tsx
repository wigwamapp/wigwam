import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Button,
  Container,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../components/Dialog';
import { useWallet } from '../../providers';
import { useHeaderStoreContext, useRouteExecutionStore, useExecutingRoutesIds } from '../../stores';
import { RouteExecutionStatus, useTransactionHistory } from '../../stores/routes';
import { TransactionHistoryEmpty } from './TransactionHistoryEmpty';
import { TransactionHistoryItem } from './TransactionHistoryItem';
import { TransactionActiveItem } from './TransactionActiveItem';
import backIcon from '../../../../src/app/icons/back.svg';

export const TransactionHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWallet();
  const transactions = useTransactionHistory(account.address);
  const executingRoutes = useExecutingRoutesIds(account.address);
  const headerStoreContext = useHeaderStoreContext();
  const deleteRoutes = useRouteExecutionStore((store) => store.deleteRoutes);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDialog = useCallback(() => {
    setOpen((open) => !open);
  }, []);

  useEffect(() => {
    console.log(executingRoutes)
  }, [executingRoutes])

  useEffect(() => {
    if (transactions.length) {
      return headerStoreContext.getState().setAction(
        <IconButton size="medium" edge="end" onClick={toggleDialog}>
          <DeleteIcon />
        </IconButton>,
      );
    }
  }, [transactions.length, toggleDialog, headerStoreContext]);

  if (!transactions.length) {
    return <TransactionHistoryEmpty />;
  }

  return (
    <Container sx={{width: '480px', paddingTop: '0', maxHeight: '75vh', overflowX: 'scroll', borderRight: '1px solid #21262A'}}>
      <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '30px', position: 'fixed', paddingBottom: '10px', zIndex: '10', width: '100%', background: '#181a1f'}}>
        <img style={{marginRight: '24px', cursor: 'pointer'}} src={backIcon} onClick={() => navigate('/')}/>
        <Typography color={'#fff'} fontSize={16} sx={{fontWeight: '600 !important'}}>Transaction History</Typography>
      </div>
      <Stack spacing={2} mt={1} sx={{marginTop: '44px'}}>
        {executingRoutes.length > 0 && (
          executingRoutes.map((routeId) => (
            <TransactionActiveItem key={routeId} routeId={routeId} />
          ))
        )}
        {transactions.length ? (
          transactions.map(({ route, status }) => (
            <TransactionHistoryItem key={route.id} route={route} status={status}/>
          ))
        ) : (
          <TransactionHistoryEmpty />
        )}
      </Stack>
      <Dialog open={open} onClose={toggleDialog}>
        <DialogTitle>{t('warning.title.deleteTransactionHistory')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('warning.message.deleteTransactionHistory')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{t('button.cancel')}</Button>
          <Button
            variant="contained"
            onClick={() => deleteRoutes('completed')}
            autoFocus
          >
            {t('button.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
