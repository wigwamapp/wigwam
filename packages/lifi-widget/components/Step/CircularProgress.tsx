import type { Process } from '@lifi/sdk';
import DoneIcon from '@mui/icons-material/Done';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { darken } from '@mui/material/styles';
import {
  CircularIcon,
  CircularProgressPending,
} from './CircularProgress.style';

export function CircularProgress({ process, size }: { process: Process, size?: number }) {
  return (
    <CircularIcon status={process.status} substatus={process.substatus}>
      {process.status === 'STARTED' || process.status === 'PENDING' ? (
        <CircularProgressPending size={size ? size : 25} sx={{marginLeft: '8px'}} thickness={3} />
      ) : null}
      {process.status === 'ACTION_REQUIRED' ? (
        <InfoRoundedIcon
          color="info"
          sx={{
            position: 'absolute',
            fontSize: '1rem',
          }}
        />
      ) : null}
      {process.status === 'DONE' &&
      (process.substatus === 'PARTIAL' || process.substatus === 'REFUNDED') ? (
        <WarningRoundedIcon
          sx={(theme) => ({
            position: 'absolute',
            fontSize: '1rem',
            color: darken(theme.palette.warning.main, 0.32),
          })}
        />
      ) : process.status === 'DONE' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
        <rect y="0.824219" width="24" height="24" rx="12" fill="#5AA94D"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M18.7722 7.99734C19.0759 8.30108 19.0759 8.79354 18.7722 9.09728L10.2166 17.6528C9.9129 17.9566 9.42044 17.9566 9.11669 17.6528L5.22781 13.7639C4.92406 13.4602 4.92406 12.9677 5.22781 12.664C5.53155 12.3603 6.02401 12.3603 6.32775 12.664L9.66667 16.0029L17.6723 7.99734C17.976 7.6936 18.4685 7.6936 18.7722 7.99734Z" fill="white"/>
        </svg>
      ) : null}
      {process.status === 'FAILED' ? (
        <ErrorRoundedIcon
          color="error"
          sx={{
            position: 'absolute',
            fontSize: '1rem',
          }}
        />
      ) : null}
    </CircularIcon>
  );
}
