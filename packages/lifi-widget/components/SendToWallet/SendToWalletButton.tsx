import { Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWidgetEvents } from '../../hooks';
import { FormKey, useWidgetConfig } from '../../providers';
import { useSendToWalletStore, useSettings } from '../../stores';
import { DisabledUI, HiddenUI, RequiredUI, WidgetEvent } from '../../types';

export const SendToWalletButton: React.FC = () => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const emitter = useWidgetEvents();
  const { disabledUI, hiddenUI, requiredUI } = useWidgetConfig();
  const { showSendToWallet, toggleSendToWallet } = useSendToWalletStore();
  const { showDestinationWallet } = useSettings(['showDestinationWallet']);

  if (
    !showDestinationWallet ||
    hiddenUI?.includes(HiddenUI.ToAddress) ||
    requiredUI?.includes(RequiredUI.ToAddress)
  ) {
    return null;
  }

  const handleClick = () => {
    if (showSendToWallet && !disabledUI?.includes(DisabledUI.ToAddress)) {
      setValue(FormKey.ToAddress, '', { shouldTouch: true });
    }
    toggleSendToWallet();
    emitter.emit(
      WidgetEvent.SendToWalletToggled,
      useSendToWalletStore.getState().showSendToWallet,
    );
  };

  return (
    <div style={{display: 'flex', justifyContent: 'space-between', marginRight: '24px', marginLeft: '0', marginBottom: showSendToWallet ? '10px' : '24px'}}>
      <Typography color={'#fff'} fontSize={14} sx={{fontWeight: '600 !important'}}>Send to different address</Typography>
      <div className={`switcher ${showSendToWallet ? 'active' : 'unactive'}`} onClick={handleClick}>
        <div className='point' />
      </div>
    </div>
    // <Tooltip
    //   title={t('main.sendToWallet')}
    //   placement="bottom-end"
    //   enterDelay={400}
    //   arrow
    // >
    //   <Button
    //     variant={showSendToWallet ? 'contained' : 'text'}
    //     onClick={handleClick}
    //     sx={{
    //       minWidth: 48,
    //       marginLeft: 1,
    //     }}
    //   >
    //     <WalletIcon />
    //   </Button>
    // </Tooltip>
  );
};
