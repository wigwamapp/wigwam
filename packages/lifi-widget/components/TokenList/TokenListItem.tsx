import OpenInNewIcon from '@mui/icons-material/OpenInNewRounded';
import {
  Avatar,
  Box,
  Link,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Slide,
  Typography,
} from '@mui/material';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatTokenAmount,
  formatTokenPrice,
  shortenAddress,
} from '../../utils';
import { IconButton, ListItem, ListItemButton } from './TokenList.style';
import type { TokenListItemButtonProps, TokenListItemProps } from './types';
import { useWidgetConfig } from 'packages/lifi-widget/providers';

export const TokenListItem: React.FC<TokenListItemProps> = memo(
  ({
    onClick,
    size,
    start,
    token,
    chain,
    showBalance,
    isBalanceLoading,
    startAdornment,
    endAdornment,
  }) => {
    const handleClick = () => onClick?.(token.address);
    return (
      <ListItem
        disablePadding
        style={{
          height: `${size}px`,
          transform: `translateY(${start}px)`,
          borderRadius: '10px'
        }}
      >
        {startAdornment}
        <TokenListItemButton
          token={token}
          chain={chain}
          showBalance={showBalance}
          isBalanceLoading={isBalanceLoading}
          onClick={handleClick}
        />
        {endAdornment}
      </ListItem>
    );
  },
);

export const TokenListItemButton: React.FC<TokenListItemButtonProps> = ({
  onClick,
  token,
  chain,
  showBalance,
  isBalanceLoading,
}) => {
  const { t } = useTranslation();
  const { currencyRate, selectedCurrency } = useWidgetConfig();
  const priceAmount = currencyRate ? (Number(token.priceUSD) * Number(currencyRate)) : token.priceUSD
  const currency = selectedCurrency ? selectedCurrency : 'USD'
  const tokenPrice = formatTokenPrice(token.amount, String(priceAmount));
  const container = useRef(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  const [showAddress, setShowAddress] = useState(false);

  const onMouseEnter = () => {
    timeoutId.current = setTimeout(() => setShowAddress(true), 350);
  };

  const onMouseLeave = () => {
    clearTimeout(timeoutId.current);
    if (showAddress) {
      setShowAddress(false);
    }
  };

  return (
    <ListItemButton
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{borderRadius: '10px'}}
      dense
    >
      <ListItemAvatar>
        <Avatar src={token.logoURI} alt={token.symbol} sx={{width: '40px', height: '40px'}}>
          {token.symbol?.[0]}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        sx={{lineHeight: 1}}
        primary={<div style={{fontSize: '14px', fontWeight: '700'}}>{token.name}</div>}
        secondaryTypographyProps={{
          component: 'div',
        }}
        secondary={
          <Box position="relative" height={15} sx={{color: '#737C88', fontSize: '12px'}} ref={container}>
            <Slide
              direction="down"
              in={!showAddress}
              container={container.current}
              style={{
                position: 'absolute',
              }}
              appear={false}
            >
              <Box>{token.symbol}</Box>
            </Slide>
            <Slide
              direction="up"
              in={showAddress}
              container={container.current}
              style={{
                position: 'absolute',
              }}
              appear={false}
              mountOnEnter
            >
              <Box display="flex">
                <Box display="flex" alignItems="center">
                  {shortenAddress(token.address)}
                </Box>
                <IconButton
                  size="small"
                  LinkComponent={Link}
                  disableRipple
                  disableFocusRipple
                  className='preventHoverEffect'
                  href={`${chain?.metamask.blockExplorerUrls[0]}address/${token.address}`}
                  target="_blank"
                  rel="nofollow noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <OpenInNewIcon />
                </IconButton>
              </Box>
            </Slide>
          </Box>
        }
      />
      {showBalance ? (
        isBalanceLoading ? (
          <TokenAmountSkeleton />
        ) : (
          <Box sx={{ textAlign: 'right' }}>
            {Number(token.amount) ? (
              <Typography variant="body1" sx={{color: '#C0C1C3', fontWeight: '700 !important'}} noWrap>
                {t('format.number', {
                  value: formatTokenAmount(token.amount),
                })}
              </Typography>
            ) : null}
            {tokenPrice ? (
              <Typography
                fontWeight={400}
                fontSize={12}
                color="text.secondary"
                data-price={token.priceUSD}
              >
                {t(`format.currency`, {
                  value: tokenPrice,
                  currency: currency
                })}
              </Typography>
            ) : null}
          </Box>
        )
      ) : null}
    </ListItemButton>
  );
};

export const TokenListItemSkeleton = () => {
  return (
    <ListItem
      secondaryAction={<TokenAmountSkeleton />}
      disablePadding
      sx={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}
    >
      <ListItemAvatar>
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ marginLeft: 1.5, marginRight: 2 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={<Skeleton variant="text" width={48} height={20} />}
        secondary={<Skeleton variant="text" width={96} height={20} />}
      />
    </ListItem>
  );
};

export const TokenAmountSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <Skeleton variant="text" width={56} height={24} />
      <Skeleton variant="text" width={48} height={18} />
    </Box>
  );
};
