import type { LifiStep, Process } from '@lifi/sdk';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { Box, Link, Typography, Button, Tooltip } from '@mui/material';
import { useProcessMessage, useRouteExecution } from '../../hooks';
import { CircularProgress } from './CircularProgress';
import { LinkButton } from './StepProcess.style';
import { useLocation, useNavigate } from 'react-router-dom'
import TooltipIcon from "app/components/elements/TooltipIcon";

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
          sx={{marginLeft: '8px !important', display: 'flex', flexDirection: needToShowContinueButton(process) ? 'column' : 'row'}}
        >
          {title} {needToShowContinueButton(process) ? <Button sx={{borderRadius: '6px', width: '120px', marginTop: '5px', fontSize: '12px', height: '25px'}} onClick={() => handleRestart()}>Continue</Button> : ''}
          {title === 'Waiting for destination chain' ? 
            <Tooltip
            title="Sometimes it takes up to 10-30 min to confirm, keep calm - your money is safe"
            placement="top"
            enterDelay={400}
            arrow
          >
              <div style={{marginLeft: '0.5rem', cursor: 'pointer'}}>
                <TooltipIcon className="!w-4 !h-4" />
              </div>
              {/* <div className='tooltipIcon'>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4ZM0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20Z" fill="#999999"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 24C18.8954 24 18 23.1046 18 22L18 10C18 8.89543 18.8954 8 20 8C21.1046 8 22 8.89543 22 10L22 22C22 23.1046 21.1046 24 20 24Z" fill="#999999"/>
                  <path d="M17 29C17 27.3431 18.3431 26 20 26C21.6569 26 23 27.3431 23 29C23 30.6569 21.6569 32 20 32C18.3431 32 17 30.6569 17 29Z" fill="#999999"/>
                </svg>
              </div> */}
          </Tooltip> : null}
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
