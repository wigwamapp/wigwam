/* eslint-disable react/no-array-index-key */
import { Collapse, Grow, } from '@mui/material';
import { useMatch } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
// import { ProgressToNextUpdate } from '../ProgressToNextUpdate';
// import { RouteCard, RouteCardSkeleton, RouteNotFoundCard } from '../RouteCard';

import {
  CollapseContainer,
} from '../../components/Routes/RoutesExpanded.style';

const timeout = { enter: 225, exit: 225, appear: 0 };

export const SettingsPageExpanded = () => {
  const element = useMatch('/');
  return (
    <CollapseContainer sx={{ overflowY: 'auto', scrollbarGutter: 'stable', overflowX: 'hidden'}}>
      <Collapse timeout={timeout} in={!!element} orientation="horizontal">
        <Grow timeout={timeout} in={!!element} mountOnEnter unmountOnExit>
          <div>
            <SettingsPage />
          </div>
        </Grow>
      </Collapse>
    </CollapseContainer>
  );
};

