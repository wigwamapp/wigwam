import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Card } from '../../components/Card';

export const ChainCard = styled(Card)({
  display: 'grid',
  placeItems: 'center',
  minWidth: 127,
  height: 48,
  borderRadius: 8,
  border: 'none',
  background: '#22262A',
});

export const ChainContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(127px, 1fr))',
  gridAutoRows: '48px',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}));
