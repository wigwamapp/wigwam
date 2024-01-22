import { Box, Container, Typography } from '@mui/material';
import { ColorSchemeButtonGroup } from './ColorSchemeButtonGroup';
import { EnabledToolsButton } from './EnabledToolsButton';
import { GasPriceSelect } from './GasPriceSelect';
// import { LanguageSelect } from './LanguageSelect';
import { ResetSettingsButton } from './ResetSettingsButton';
import { RoutePrioritySelect } from './RoutePrioritySelect';
import { ShowDestinationWallet } from './ShowDestinationWallet';
import { SlippageInput } from './SlippageInput';
import { useEffect, useState } from 'react';
import { SelectEnabledToolsPage } from '../SelectEnabledToolsPage';
import backIcon from '../../../../src/app/icons/back.svg'
import { useNavigateBack } from 'packages/lifi-widget/hooks';

export const SettingsPage = () => {
  const [currentTab, setCurrentTab] = useState<null|string>(null);
  const { navigateBack } = useNavigateBack();

  const renderContent = () => {
    switch (currentTab) {
      case null:
        return (
          <>
            <Box px={3} pt={1}>
                <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '30px'}}>
                  <img style={{marginRight: '24px', cursor: 'pointer'}} src={backIcon} onClick={() => navigateBack()}/>
                  <Typography color={'#fff'} fontSize={16} fontWeight={600}>Settings</Typography>
                </div>
                <ColorSchemeButtonGroup />
                {/* <LanguageSelect /> */}
                <RoutePrioritySelect />
                <Box sx={{ display: 'flex', alignItems: 'center' }} mt={2}>
                  <Box pr={2} flex={1}>
                    <SlippageInput />
                  </Box>
                  <GasPriceSelect />
                </Box>
              </Box>
              <ShowDestinationWallet />
              <Box px={1.5}>
                <EnabledToolsButton type="Bridges" handleClick={() => setCurrentTab('bridges')} />
                <EnabledToolsButton type="Exchanges"  handleClick={() => setCurrentTab('exchanges')} />
              </Box>
              <ResetSettingsButton />
          </>
        )
      case 'bridges':
        return (
          <div style={{paddingLeft: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingBottom: '14px'}}>
              <img style={{marginRight: '24px', cursor: 'pointer'}} src={backIcon} onClick={() => setCurrentTab(null)}/>
              <Typography color={'#fff'} fontSize={16} fontWeight={600}>Enabled Bridges</Typography>
            </div>
            <SelectEnabledToolsPage type="Bridges" />
          </div>
        )
      case 'exchanges':
        return (
          <div style={{paddingLeft: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingBottom: '14px'}}>
              <img style={{marginRight: '24px', cursor: 'pointer'}} src={backIcon} onClick={() => setCurrentTab(null)}/>
              <Typography color={'#fff'} fontSize={16} fontWeight={600}>Enabled Exchanges</Typography>
            </div>
            <SelectEnabledToolsPage type="Exchanges" />
          </div>
        )

    }
  }

  return (
    <Container disableGutters sx={{width: '340px', paddingTop: '12px'}}>
        {renderContent()}
    </Container>
  );
};
