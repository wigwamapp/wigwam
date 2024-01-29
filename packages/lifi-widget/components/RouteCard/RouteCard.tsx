import type { TokenAmount } from '@lifi/sdk';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import type { TooltipProps } from '@mui/material';
import { Box, Collapse, Tooltip, Typography } from '@mui/material';
import type { MouseEventHandler } from 'react';
import { Fragment, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useWidgetConfig } from '../../providers';
import { formatTokenAmount } from '../../utils';
import type { CardProps } from '../Card';
import { Card, CardIconButton, CardLabel, CardLabelTypography } from '../Card';
import type { InsuredAmount } from '../Insurance';
import { StepActions } from '../StepActions';
import { Token } from '../Token';
import { RouteCardEssentials } from './RouteCardEssentials';
import type { RouteCardProps } from './types';
import { SmallAvatar } from '../SmallAvatar';
import { TextSecondary, TextSecondaryContainer } from '../Token/Token.style';

export const RouteCard: React.FC<
  RouteCardProps & Omit<CardProps, 'variant'>
> = ({ route, active, variant = 'default', expanded, ...other }) => {
  const { t } = useTranslation();
  const { subvariant } = useWidgetConfig();
  const [cardExpanded, setCardExpanded] = useState(expanded);
  const insurable = route.insurance?.state === 'INSURABLE';

  useEffect(() => {
    setCardExpanded(active)
  }, [active])

  const handleExpand: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setCardExpanded((expanded) => !expanded);
  };

  const token: TokenAmount =
    subvariant === 'nft'
      ? { ...route.fromToken, amount: route.fromAmount }
      : { ...route.toToken, amount: route.toAmount };

  const RecommendedTagTooltip =
    route.tags?.[0] === 'RECOMMENDED' ? RecommendedTooltip : Fragment;

  const cardContent = (
    <Box flex={1}>
      {subvariant !== 'refuel' && (insurable || route.tags?.length) ? (
        <Box display="flex" alignItems="center" mb={2}>
          {insurable ? (
            <InsuranceTooltip
              insuredAmount={formatTokenAmount(
                route.toAmountMin,
                route.toToken.decimals,
              )}
              insuredTokenSymbol={route.toToken.symbol}
            >
              <CardLabel
                type={
                  route.tags?.length && !cardExpanded
                    ? 'insurance-icon'
                    : 'insurance'
                }
              >
                <VerifiedUserIcon fontSize="inherit" />
                {cardExpanded || !route.tags?.length ? (
                  <CardLabelTypography type="icon">
                    {t(`main.tags.insurable`)}
                  </CardLabelTypography>
                ) : null}
              </CardLabel>
            </InsuranceTooltip>
          ) : null}
          {route.tags?.length ? (
            <RecommendedTagTooltip>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                <Box display="flex" alignItems="center" height={'fit-content'}>
                  <div className={`routeEllips ${active && 'selected'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                        <path d="M11.2204 3.15625L5.41732 8.95935L2.77954 6.32158" stroke="#0D1311" strokeWidth="1.40681" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
                  <Box pr={0.75}>
                    <SmallAvatar
                      src={route.steps[0].toolDetails.logoURI}
                      alt={route.steps[0].toolDetails.name}
                      sx={{
                        border: 0,
                        marginBottom: -0.25,
                        width: '28px',
                        height: '28px'
                      }}
                    >
                       
                      <Typography color={'#fff'} fontSize={18} sx={{fontWeight: '500 !important'}}>
                        {route.steps[0].toolDetails.name[0]}
                      </Typography>
                    </SmallAvatar>
                  </Box>
                  <Typography color={'#fff'} fontSize={18} sx={{fontWeight: '500 !important'}}>{route.steps[0].toolDetails.name}</Typography>
                </Box>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <CardLabel type={active ? 'active' : undefined} sx={{background: 'transparent', marginRight: '0'}}>
                    <CardLabelTypography sx={{borderRadius: '6px', lineHeight: '24px', border: '1px solid #717A7B', background: 'transparent', marginRight: '0', padding: '0px 8px'}} fontSize={10} color={'#fff'} fontWeight={400}>
                      {t(`main.tags.${route.tags[0].toLowerCase()}` as any)}
                    </CardLabelTypography>
                  </CardLabel>
                </div>
                
              </div>
            </RecommendedTagTooltip>
          ) : <>
          <div className={`routeEllips ${active && 'selected'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                  <path d="M11.2204 3.15625L5.41732 8.95935L2.77954 6.32158" stroke="#0D1311" strokeWidth="1.40681" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <Box display="flex" alignItems="center" height={'fit-content'}>
              <Box pr={0.75}>
                <SmallAvatar
                  src={route.steps[0].toolDetails.logoURI}
                  alt={route.steps[0].toolDetails.name}
                  sx={{
                    border: 0,
                    marginBottom: -0.25,
                    width: '28px',
                    height: '28px'
                  }}
                >
                  <Typography color={'#fff'} fontSize={18} sx={{fontWeight: '500 !important'}}>
                    {route.steps[0].toolDetails.name[0]}
                  </Typography>
                </SmallAvatar>
              </Box>
              <Typography color={'#fff'} fontSize={18} sx={{fontWeight: '500 !important'}}>{route.steps[0].toolDetails.name}</Typography>
            </Box></>}
        </Box>
      ) : <Box display="flex" alignItems="center" mb={2} sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
            <>
              <div className={`routeEllips ${active && 'selected'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                  <path d="M11.2204 3.15625L5.41732 8.95935L2.77954 6.32158" stroke="#0D1311" strokeWidth="1.40681" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <Box display="flex" alignItems="center" height={'fit-cintent'}>
              <Box pr={0.75}>
                <SmallAvatar
                  src={route.steps[0].toolDetails.logoURI}
                  alt={route.steps[0].toolDetails.name}
                  sx={{
                    border: 0,
                    marginBottom: -0.25,
                    width: '28px',
                    height: '28px'
                  }}
                >
                  <Typography color={'#fff'} fontSize={18}  sx={{fontWeight: '500 !important'}}>
                    {route.steps[0].toolDetails.name[0]}
                  </Typography>
                </SmallAvatar>
              </Box>
              <Typography color={'#fff'} fontSize={18}  sx={{fontWeight: '500 !important'}}>{route.steps[0].toolDetails.name}</Typography>
            </Box>
            </>
          </Box>}
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Token
          token={token}
          step={!cardExpanded ? route.steps[0] : undefined}
        />
        <CardIconButton onClick={handleExpand} size="small">
          {cardExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </CardIconButton>
      </Box>
      <Collapse timeout={225} in={cardExpanded} mountOnEnter unmountOnExit>
        {route.steps.map((step) => (
          <StepActions key={step.id} step={step} mt={2} />
        ))}
      </Collapse>
      <RouteCardEssentials route={route} />
    </Box>
  );

  return subvariant === 'refuel' || variant === 'cardless' ? (
    cardContent
  ) : (
    <Card
      variant={active ? 'selected' : 'default'}
      selectionColor="secondary"
      indented
      className='withHover'
      sx={{borderRadius: '10px', background: '#22262A', border: `1px solid ${active ? '#80EF6E' : '#32393E'}`}}
      {...other}
    >
      {cardContent}
    </Card>
  );
};

const InsuranceTooltip: React.FC<
  InsuredAmount & Pick<TooltipProps, 'children'>
> = ({ insuredAmount, insuredTokenSymbol, children }) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      title={
        <Box component="span">
          <Typography fontSize={12} fontWeight="500">
            <Trans
              i18nKey="insurance.insure"
              values={{
                amount: insuredAmount,
                tokenSymbol: insuredTokenSymbol,
              }}
              components={[<strong />]}
            />
          </Typography>
          <Box
            sx={{
              listStyleType: 'disc',
              pl: 2,
            }}
          >
            <Typography fontSize={12} fontWeight="500" display="list-item">
              {t('insurance.bridgeExploits')}
            </Typography>
            <Typography fontSize={12} fontWeight="500" display="list-item">
              {t('insurance.slippageError')}
            </Typography>
          </Box>
        </Box>
      }
      placement="top"
      enterDelay={400}
      arrow
    >
      {children}
    </Tooltip>
  );
};

const RecommendedTooltip: React.FC<Pick<TooltipProps, 'children'>> = ({
  children,
}) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      title={t('tooltip.recommended')}
      placement="top"
      enterDelay={400}
      arrow
    >
      {children}
    </Tooltip>
  );
};
