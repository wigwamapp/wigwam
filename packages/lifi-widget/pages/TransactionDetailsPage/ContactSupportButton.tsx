import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useWidgetEvents } from '../../hooks/';
import { WidgetEvent } from '../../types/events';

interface ContactSupportButtonProps {
  supportId?: string;
}

export const ContactSupportButton = ({
  supportId,
}: ContactSupportButtonProps) => {
  const { t } = useTranslation();
  const widgetEvents = useWidgetEvents();


  const handleClick = () => {
    if (!widgetEvents.all.has(WidgetEvent.RouteContactSupport)) {
      const url = 'https://discord.gg/lifi';

      Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener noreferrer',
        href: url,
      }).click();
      // window.open(url, target, rel);

    } else {
      widgetEvents.emit(WidgetEvent.RouteContactSupport, { supportId });
    }
  };

  return (
    <Button onClick={handleClick} fullWidth sx={{background: 'transparent', fontSize: '16px', fontWeight: '600px', borderRadius: '6px', border: '1px solid #444955', color: '#fff'}}>
      {t('button.contactSupport')}
    </Button>
  );
};
