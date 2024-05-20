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
            <Box sx={{paddingLeft: '24px'}}>
                <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '30px', paddingTop: '12px'}}>
                  <img style={{marginRight: '24px', cursor: 'pointer'}} className='backButtonWrapper' src={backIcon} onClick={() => navigateBack()}/>
                  <Typography color={'#fff'} fontSize={16} sx={{fontWeight: '600 !important'}}>Settings</Typography>
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
            <div style={{display: 'flex', justifyContent: 'flex-start', position: 'sticky', top: '-1px', zIndex: '10', background: '#181a1f', alignItems: 'center', paddingBottom: '14px', paddingTop: '12px', width: '321px'}}>
              <img style={{marginRight: '24px', cursor: 'pointer'}} className='backButtonWrapper' src={backIcon} onClick={() => setCurrentTab(null)}/>
              <Typography color={'#fff'} fontSize={16} sx={{fontWeight: '600 !important'}}>Enabled Bridges</Typography>
            </div>
            <div  style={{position: 'relative', bottom: '20px'}}>
              <SelectEnabledToolsPage type="Bridges" />
            </div>
          </div>
        )
      case 'exchanges':
        return (
          <div style={{paddingLeft: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'flex-start', position: 'sticky', top: '-1px', zIndex: '10', background: '#181a1f', alignItems: 'center', paddingBottom: '14px', paddingTop: '12px',  width: '321px'}}>
              <img style={{marginRight: '24px', cursor: 'pointer'}} className='backButtonWrapper' src={backIcon} onClick={() => setCurrentTab(null)}/>
              <Typography color={'#fff'} fontSize={16} sx={{fontWeight: '600 !important'}}>Enabled Exchanges</Typography>
            </div>
            <div style={{position: 'relative', bottom: '20px'}}>
              <SelectEnabledToolsPage type="Exchanges" />
            </div>
          </div>
        )

    }
  }

  return (
    <Container disableGutters sx={{width: '340px'}}>
        {renderContent()}
    </Container>
  );
};
