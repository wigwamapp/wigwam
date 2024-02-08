import type { BoxProps } from '@mui/material';
import { Stack } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../../providers';
import { usePendingRoutesIds } from '../../stores';
import { Card } from '../Card';
import { ActiveTransactionItem } from './ActiveTransactionItem';

export const ActiveTransactions: React.FC<BoxProps> = (props) => {
  const navigate = useNavigate();
  const { pathname } = useLocation()
  const { account } = useWallet();

  const executingRoutes = usePendingRoutesIds(account.address);
  if (!executingRoutes?.length) {
    return null;
  }

  const handleShowAll = () => {
    navigate(`${pathname}?tab=transactionHistory`);
  };

  const hasShowAll = executingRoutes?.length > 1;

  return (
    <div style={{position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px'}}>
      <Card onClick={handleShowAll} className='withHover' variant="selected" selectionColor="secondary" {...props} sx={{border: '1px solid #ffcf26', zIndex: 10, width: '100%', background: '#2B3037', cursor: 'pointer', marginLeft: '0px'}}>
        <Stack sx={{paddingTop: '16px', paddingBottom: '16px'}}>
          {executingRoutes.slice(0, 1).map((routeId) => (
            <ActiveTransactionItem key={routeId} routeId={routeId} dense />
          ))}
        </Stack>
        
      </Card>
      {hasShowAll ? (
        <div style={{position: 'absolute', opacity: '0.5', borderRadius: '10px', top: '-3px', width: '85%', marginRight: '24px', height: '58px', zIndex: 1, background: '#2B3037', border: '1px solid #ffcf26'}}></div>
      ) : null}
    </div>
    
  );
};
