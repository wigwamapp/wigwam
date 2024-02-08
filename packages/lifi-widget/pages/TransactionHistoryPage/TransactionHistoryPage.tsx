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
    if (transactions.length) {
      return headerStoreContext.getState().setAction(
        <IconButton size="medium" edge="end" onClick={toggleDialog}>
          <DeleteIcon />
        </IconButton>,
      );
    }
  }, [transactions.length, toggleDialog, headerStoreContext]);

  if (!transactions.length && !executingRoutes.length) {
    return <TransactionHistoryEmpty />;
  }

  return (
    <Container sx={{width: '500px', paddingTop: '0', height: '100%', overflowY: 'auto', scrollbarGutter: 'stable', overflowX: 'hidden', borderRight: '1px solid #21262A'}}>
      <div style={{display: 'flex', paddingTop: '12px', width: '460px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'sticky', top: '-1px', paddingBottom: '10px', zIndex: '10', background: '#181a1f', marginTop: '-1px'}}>
          <Typography color={'#fff'} fontSize={16} sx={{fontWeight: '600 !important'}}>Transaction history</Typography>
          <div onClick={() => navigate('/')} style={{cursor: 'pointer'}} className='closeButtonWrapper'>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M0.292893 1.11711C0.683417 0.726588 1.31658 0.726588 1.70711 1.11711L6 5.41001L10.2929 1.11711C10.6834 0.726588 11.3166 0.726588 11.7071 1.11711C12.0976 1.50764 12.0976 2.1408 11.7071 2.53133L7.41421 6.82422L11.7071 11.1171C12.0976 11.5076 12.0976 12.1408 11.7071 12.5313C11.3166 12.9219 10.6834 12.9219 10.2929 12.5313L6 8.23843L1.70711 12.5313C1.31658 12.9219 0.683417 12.9219 0.292893 12.5313C-0.0976311 12.1408 -0.0976311 11.5076 0.292893 11.1171L4.58579 6.82422L0.292893 2.53133C-0.0976311 2.1408 -0.0976311 1.50764 0.292893 1.11711Z" fill="white"/>
          </svg>
          </div>
      </div>
      <Stack spacing={2} mt={1} sx={{marginTop: '14px'}}>
        {executingRoutes.length > 0 && (
          executingRoutes.map((routeId) => (
            <TransactionActiveItem key={routeId} routeId={routeId} />
          ))
        )}
        {transactions.length > 0 && (
          transactions.map(({ route, status }) => (
            <TransactionHistoryItem key={route.id} route={route} status={status}/>
          ))
        )}
        {(!transactions.length && !executingRoutes.length) && (
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
