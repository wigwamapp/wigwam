import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useNavigateBack } from '../../hooks';
import { useWallet, useWidgetConfig } from '../../providers';
import { useHeaderStore } from '../../stores';
import { HiddenUI } from '../../types';
import {
  backButtonRoutes,
  navigationRoutes,
  navigationRoutesValues,
} from '../../utils';
import { HeaderAppBar } from './Header.style';
import { NavigationTabs } from './NavigationTabs';
import { WalletMenuButton } from './WalletHeader';

export const NavigationHeader: React.FC = () => {
  const { t } = useTranslation();
  const { subvariant, hiddenUI, variant } = useWidgetConfig();
  const { navigate, navigateBack } = useNavigateBack();
  const { account } = useWallet();
  const { element, title } = useHeaderStore((state) => state);
  const { pathname, search } = useLocation();

  const cleanedPathname = pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
  const path = cleanedPathname.substring(cleanedPathname.lastIndexOf('/') + 1);
  const hasPath = navigationRoutesValues.includes(path);

  const splitSubvariant = subvariant === 'split' && !hasPath;

  const handleHeaderTitle = () => {
    switch (path) {
      case navigationRoutes.selectWallet:
        return t(`header.selectWallet`);
      case navigationRoutes.settings:
        return t(`header.settings`);
      case navigationRoutes.bridges:
        return t(`settings.enabledBridges`);
      case navigationRoutes.exchanges:
        return t(`settings.enabledExchanges`);
      case navigationRoutes.transactionHistory:
        return t(`header.transactionHistory`);
      case navigationRoutes.fromToken: {
        if (subvariant === 'nft') {
          return t(`header.payWith`);
        }
        return t(`header.from`);
      }
      case navigationRoutes.toToken:
        return t(`header.to`);
      case navigationRoutes.fromChain:
      case navigationRoutes.toChain:
      case navigationRoutes.toTokenNative:
        return t(`header.selectChain`);
      case navigationRoutes.routes:
        return t(`header.youGet`);
      case navigationRoutes.activeTransactions:
        return t(`header.activeTransactions`);
      case navigationRoutes.transactionExecution: {
        if (subvariant === 'nft') {
          return t(`header.purchase`);
        }
        return t(`header.exchange`);
      }
      case navigationRoutes.transactionDetails: {
        if (subvariant === 'nft') {
          return t(`header.purchaseDetails`);
        }
        return t(`header.transactionDetails`);
      }
      default: {
        switch (subvariant) {
          case 'nft':
            return t(`header.checkout`);
          case 'refuel':
            return t(`header.gas`);
          default:
            return t(`header.exchange`);
        }
      }
    }
  };

  return (
    <>
      <HeaderAppBar elevation={0} style={{justifyContent: 'space-between', paddingLeft: pathname === '/' ? '0' : '24px'}} className='preventHover'>
        {backButtonRoutes.includes(path) ? (
          <IconButton size="medium" edge="start" onClick={navigateBack}>
            <ArrowBackIcon />
          </IconButton>
        ) : null}
        {splitSubvariant ? (
          <Box flex={1}>
            {!hiddenUI?.includes(HiddenUI.WalletMenu) ? (
              <WalletMenuButton />
            ) : null}
          </Box>
        ) : (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Typography
              fontSize={20}
              align={'left'}
              color={'#fff'}
              sx={{fontWeight: '600 !important'}}
              flex={1}
              noWrap
            >
              {title || handleHeaderTitle()}
            </Typography>
            {/* {(title === 'Swap Exchange' || handleHeaderTitle() === 'Swap Exchange') && <img src={SwapArrows} style={{marginLeft: '12px'}}/>} */}
          </div>
        )}
        <Routes>
          <Route
            path={navigationRoutes.home}
            element={
              <Box
                paddingRight={
                  variant === 'drawer' && subvariant === 'split' ? 5 : 0
                }
              >
                {account.isActive && !hiddenUI?.includes(HiddenUI.History) ? (
                  <Tooltip
                    title={t(`header.transactionHistory`)}
                    enterDelay={400}
                    arrow
                  >
                    <IconButton
                      size="small"
                      edge="start"
                      disableRipple
                      className='withHover'
                      sx={{
                        background: '#2C3036',
                        borderRadius: '4px',
                        padding: '3px',
                        marginRight: '8px'
                      }}
                      onClick={() =>
                        search.includes('transactionHistory') ? navigate(`${pathname}`) : navigate(`${pathname}?tab=transactionHistory`)
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                      <path d="M13.2353 7.0386C13.2353 6.84449 13.0765 6.68566 12.8824 6.68566H7.23529C7.04118 6.68566 6.88235 6.84449 6.88235 7.0386C6.88235 7.23272 7.04118 7.39154 7.23529 7.39154H12.8824C13.0765 7.39154 13.2353 7.23272 13.2353 7.0386ZM12.8824 9.15625H7.23529C7.04118 9.15625 6.88235 8.99743 6.88235 8.80331C6.88235 8.60919 7.04118 8.45037 7.23529 8.45037H12.8824C13.0765 8.45037 13.2353 8.60919 13.2353 8.80331C13.2353 8.99743 13.0765 9.15625 12.8824 9.15625ZM12.8824 10.921H7.23529C7.04118 10.921 6.88235 10.7621 6.88235 10.568C6.88235 10.3739 7.04118 10.2151 7.23529 10.2151H12.8824C13.0765 10.2151 13.2353 10.3739 13.2353 10.568C13.2353 10.7621 13.0765 10.921 12.8824 10.921ZM12.8824 5.62684H7.23529C7.04118 5.62684 6.88235 5.46801 6.88235 5.2739C6.88235 5.07978 7.04118 4.92096 7.23529 4.92096H12.8824C13.0765 4.92096 13.2353 5.07978 13.2353 5.2739C13.2353 5.46801 13.0765 5.62684 12.8824 5.62684ZM3.35294 11.9798V13.3915C3.35294 14.3657 4.14353 15.1562 5.11765 15.1562H13.2353C14.0153 15.1562 14.6471 14.5245 14.6471 13.7445V3.50919C14.6471 3.31507 14.4882 3.15625 14.2941 3.15625H5.82353C5.62941 3.15625 5.47059 3.31507 5.47059 3.50919V11.8351L4.76471 12.541L3.95647 11.7292C3.85412 11.6304 3.70235 11.5986 3.57176 11.6551C3.43765 11.708 3.35294 11.8386 3.35294 11.9798ZM6.17647 3.86213H13.9412V13.7445C13.9412 14.1327 13.6235 14.4504 13.2353 14.4504C12.8471 14.4504 12.5294 14.1327 12.5294 13.7445V11.9798C12.5294 11.8386 12.4447 11.708 12.3106 11.6551C12.18 11.5986 12.0282 11.6304 11.9259 11.7292L11.1176 12.541L10.3094 11.7292C10.1718 11.5915 9.94588 11.5915 9.80823 11.7292L9 12.541L8.19176 11.7292C8.05412 11.5915 7.82824 11.5915 7.69059 11.7292L6.88235 12.541L6.17647 11.8351V3.86213Z" fill="white"/>
                      </svg>
                    </IconButton>
                  </Tooltip>
                ) : null}
                <Tooltip title={t(`header.settings`)} enterDelay={400} arrow>
                  <IconButton
                    size="small"
                    disableRipple
                    className='withHover'
                    onClick={() => search.includes('settings') ? navigate(`${pathname}`) : navigate(`${pathname}?tab=settings`)}
                    sx={{
                      background: '#2C3036',
                      borderRadius: '4px',
                      padding: '3px'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.4193 14.8708L10.6034 13.4194C10.6812 12.8054 11.3202 12.4361 11.8904 12.6754L13.2395 13.2418C13.3943 13.3067 13.5657 13.2492 13.6497 13.1039L14.7442 11.2084C14.8275 11.0639 14.7918 10.8849 14.6591 10.7841L13.494 9.89909C12.9992 9.5232 12.9993 8.78945 13.494 8.41341L14.6591 7.52838C14.7918 7.42757 14.8277 7.24864 14.7442 7.10412L13.6497 5.20861C13.5657 5.06333 13.3943 5.00579 13.2395 5.07069L11.8904 5.63708C11.3202 5.8764 10.6812 5.50712 10.6034 4.89311L10.4193 3.44155C10.3986 3.27809 10.2611 3.15625 10.0942 3.15625H7.90562C7.73885 3.15625 7.60124 3.27794 7.58051 3.44155L7.39647 4.89311C7.35876 5.19058 7.19711 5.43336 6.93765 5.58344L6.93795 5.58404C6.67955 5.73323 6.38389 5.75231 6.10941 5.63708L4.7603 5.07069C4.55884 4.98611 4.37104 5.13079 4.35016 5.20861L3.25585 7.10412C3.17247 7.24864 3.20823 7.42757 3.34088 7.52838L4.50595 8.41341C5.00083 8.78945 5.00083 9.52305 4.50595 9.89909L3.34088 10.7841C3.20823 10.8849 3.17232 11.064 3.25585 11.2084L4.35031 13.1039C4.43429 13.2492 4.60571 13.3067 4.76045 13.2418L6.10956 12.6754C6.38404 12.5602 6.6797 12.5793 6.9381 12.7286L6.9378 12.7292C7.19726 12.8793 7.35891 13.1219 7.39662 13.4195L7.58066 14.871C7.60139 15.0346 7.73885 15.1562 7.90577 15.1562H10.0944C10.2611 15.1561 10.3986 15.0343 10.4193 14.8708ZM8.99993 6.75137C11.1355 6.75137 12.2119 9.34562 10.7004 10.857C9.18892 12.3683 6.59497 11.2919 6.59497 9.15633C6.59497 7.82825 7.6717 6.75137 8.99993 6.75137Z" fill="white"/>
                    </svg>
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          <Route path="*" element={element || <Box width={28} height={40} />} />
        </Routes>
      </HeaderAppBar>
      {splitSubvariant ? <NavigationTabs /> : null}
    </>
  );
};
