/* eslint-disable react/no-array-index-key */
import { useState } from 'react';
import { Collapse, Grow } from '@mui/material';
import { useMatch } from 'react-router-dom';
import { TransactionPage } from './TransactionPage';

import {
  CollapseContainer,
} from '../../components/Routes/RoutesExpanded.style';

const timeout = { enter: 225, exit: 225, appear: 0 };

export const TransactionPageExpanded = () => {
  const element = useMatch('/');
  return (
    <CollapseContainer sx={{ overflowY: 'auto', scrollbarGutter: 'stable', overflowX: 'hidden'}}>
      <Collapse timeout={timeout} in={!!element} orientation="horizontal">
        <Grow timeout={timeout} in={!!element} mountOnEnter unmountOnExit>
          <div>
            <TransactionPage />
          </div>
        </Grow>
      </Collapse>
    </CollapseContainer>
  );
};