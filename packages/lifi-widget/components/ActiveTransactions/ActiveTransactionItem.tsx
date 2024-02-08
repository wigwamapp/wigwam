import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useProcessMessage, useRouteExecution } from '../../hooks';
import { RouteExecutionStatus } from '../../stores';
import { navigationRoutes } from '../../utils';
import { StepTimer } from '../Step/StepTimer';
import { TokenAvatar, TokenAvatarGroup } from '../TokenAvatar';
import { ListItem, ListItemButton } from './ActiveTransactions.style';

export const ActiveTransactionItem: React.FC<{
  routeId: string;
  dense?: boolean;
}> = ({ routeId, dense }) => {
  const navigate = useNavigate();
  const { route, status } = useRouteExecution({
    routeId,
    executeInBackground: true,
  });

  // TODO: replace with ES2023 findLast
  const lastActiveStep = route?.steps
    .slice()
    .reverse()
    .find((step) => step.execution);
  const lastActiveProcess = lastActiveStep?.execution?.process.at(-1);

  const { title } = useProcessMessage(lastActiveStep, lastActiveProcess);

  if (!route || !lastActiveStep) {
    return null;
  }

  const handleClick = () => {
    navigate(navigationRoutes.transactionExecution, { state: { routeId } });
  };

  // const getStatusComponent = () => {
  //   switch (lastActiveProcess?.status) {
  //     case 'ACTION_REQUIRED':
  //       return <InfoRoundedIcon color="info" fontSize="small" />;
  //     case 'FAILED':
  //       return <ErrorRoundedIcon color="error" fontSize="small" />;
  //     default:
  //       return (
  //         <Typography fontSize={14} fontWeight={500}>
  //           <StepTimer step={lastActiveStep} hideInProgress />
  //         </Typography>
  //       );
  //   }
  // };

  const ListItemComponent = dense ? ListItem : ListItemButton;

  return (
    <ListItemComponent onClick={handleClick} dense disableRipple={dense}>
      <ListItemAvatar>
        {/* <TokenAvatarGroup total={2}> */}
          <TokenAvatar token={route.fromToken} />
          <TokenAvatar token={route.toToken} sx={{marginLeft: '10px'}} />
        {/* </TokenAvatarGroup> */}
      </ListItemAvatar>
      <ListItemText
        sx={{ margin: 0 }}
        disableTypography
        primary={
          <Typography
            fontWeight={500}
            lineHeight={1}
            sx={{
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              marginLeft: 2,
              height: 16,
            }}
          >
            <span style={{color: '#fff', display: 'flex'}}>{parseFloat((Number(route.fromAmount)/Math.pow(10, route.fromToken.decimals)).toFixed(4))} {route.fromToken.symbol}</span>
            &nbsp;to&nbsp;
            <span style={{color: '#fff', display: 'flex'}}>{parseFloat((Number(route.toAmount)/Math.pow(10, route.toToken.decimals)).toFixed(4))} {route.toToken.symbol}</span>
          </Typography>
        }
      />
      {<div className='txStatus progress'>In Progress...</div>}
    </ListItemComponent>
  );
};
