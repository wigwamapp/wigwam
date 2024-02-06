import type { DialogProps, Theme } from '@mui/material';
import { Dialog as MuiDialog } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useGetScrollableContainer } from '../hooks';

export const modalProps = {
  sx: {
    position: 'absolute',
    overflow: 'hidden',
  },
};

export const paperProps = {
  sx: (theme: Theme) => ({
    maxWidth: '90%',
    position: 'absolute',
    backgroundImage: 'none',
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    bottom: '14rem',
    left: '10px',
    right: '10px'
  }),
};

export const backdropProps = {
  sx: {
    position: 'absolute',
    background: 'rgba(24, 26, 31, 0.55)',
  },
};

export const Dialog: React.FC<PropsWithChildren<DialogProps>> = ({
  children,
  open,
  onClose,
}) => {
  const getContainer = useGetScrollableContainer();
  return (
    <MuiDialog
      container={getContainer}
      open={open}
      onClose={onClose}
      sx={modalProps.sx}
      PaperProps={paperProps}
      BackdropProps={backdropProps}
    >
      {children}
    </MuiDialog>
  );
};
