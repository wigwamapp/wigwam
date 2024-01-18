import type { BoxProps } from '@mui/material';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../../providers';
import { useExecutingRoutesIds } from '../../stores';
import { navigationRoutes } from '../../utils';
import { Card, CardTitle } from '../Card';
import { ActiveTransactionItem } from './ActiveTransactionItem';
import { ShowAllButton } from './ActiveTransactions.style';

export const ActiveTransactions: React.FC<BoxProps> = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation()
  const { account } = useWallet();
  const executingRoutes = useExecutingRoutesIds(account.address);

  if (!executingRoutes?.length) {
    return null;
  }

  const handleShowAll = () => {
    navigate(`${pathname}?tab=transactionHistory`);
  };

  const hasShowAll = executingRoutes?.length > 2;

  return (
    <Card onClick={handleShowAll} variant="selected" selectionColor="secondary" {...props} sx={{border: '1px solid #ffcf26', background: '#2B3037', cursor: 'pointer'}}>
      <Stack spacing={1.5} pt={1.5} pb={hasShowAll ? 0 : 2}>
        {executingRoutes.slice(0, 2).map((routeId) => (
          <ActiveTransactionItem key={routeId} routeId={routeId} dense />
        ))}
      </Stack>
      {hasShowAll ? (
        <ShowAllButton disableRipple fullWidth sx={{color: '#fff'}}>
          {t('button.showAll')}
        </ShowAllButton>
      ) : null}
    </Card>
  );
};
