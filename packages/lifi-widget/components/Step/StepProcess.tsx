import type { LifiStep, Process } from '@lifi/sdk';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { Box, Link, Typography, Button } from '@mui/material';
import { useProcessMessage, useRouteExecution } from '../../hooks';
import { CircularProgress } from './CircularProgress';
import { LinkButton } from './StepProcess.style';
import { useLocation, useNavigate } from 'react-router-dom'

export const StepProcess: React.FC<{
  step: LifiStep;
  process: Process;
  routeId: string;
}> = ({ step, process, routeId }) => {
  const { title, message } = useProcessMessage(step, process);
  const {search, pathname} = useLocation();
  const navigate = useNavigate();

  const needToShowContinueButton = (process: Process) => {
    if (search.includes('transactionDetails')) {
      if (process.status === 'ACTION_REQUIRED' || process.status === 'FAILED') {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  const { restartRoute } = useRouteExecution({
    routeId: routeId,
  });

  const handleRestart = () => {
      navigate(`${pathname}?tab=transactionProcessing`, {
        state: { routeId },
      });

      restartRoute()
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          marginLeft: '9px',
        }}
      >
        <CircularProgress process={process} size={24} />
        <Typography
          mx={2}
          flex={1}
          fontSize={12}
          fontWeight={400}
          color={'#fff'}
          sx={{marginLeft: '8px !important', display: 'flex', flexDirection: 'column'}}
        >
          {title} {needToShowContinueButton(process) ? <Button sx={{borderRadius: '6px', width: '120px', marginTop: '5px', fontSize: '12px', height: '25px'}} onClick={() => handleRestart()}>Continue</Button> : ''}
        </Typography>
        {process.txLink ? (
          <LinkButton
            size="small"
            edge="end"
            LinkComponent={Link}
            href={process.txLink}
            target="_blank"
            rel="nofollow noreferrer"
            sx={{marginRight: '10px !important', background: 'rgba(204, 214, 255, 0.20)', borderRadius: '4px'}}
            className='linkButton'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M13.25 15.8242H5C4.17157 15.8242 3.5 15.1526 3.5 14.3242V6.07422C3.5 5.24579 4.17157 4.57422 5 4.57422H8V6.07422H5V14.3242H13.25V11.3242H14.75V14.3242C14.75 15.1526 14.0784 15.8242 13.25 15.8242ZM9.275 11.1045L8.2175 10.044L12.9373 5.32422H10.25V3.82422H15.5V9.07422H14V6.38547L9.275 11.1045Z" fill="#F3F9F4"/>
            </svg>
          </LinkButton>
        ) : null}
      </Box>
      {message ? (
        <Typography
          ml={6}
          fontSize={14}
          fontWeight={500}
          color="text.secondary"
        >
          {message}
        </Typography>
      ) : null}
    </Box>
  );
};
