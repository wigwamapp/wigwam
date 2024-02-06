import type { Chain, StaticToken } from '@lifi/sdk';
import type { SxProps, Theme } from '@mui/material';
import { Avatar, Badge, Skeleton } from '@mui/material';
import { useChain, useToken } from '../../hooks';
import { SmallAvatar, SmallAvatarSkeleton } from '../SmallAvatar';
import { AvatarDefault, AvatarDefaultBadge } from './TokenAvatar.style';

export const TokenAvatarFallback: React.FC<{
  token?: StaticToken;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
  mainAvatarStyle?: SxProps<Theme>
}> = ({ token, isLoading, sx, mainAvatarStyle }) => {
  const { chain } = useChain(token?.chainId);
  const { token: chainToken, isLoading: isLoadingToken } = useToken(
    token?.chainId,
    token?.address,
  );
  return (
    <TokenAvatarBase
      token={chainToken ?? token}
      isLoading={isLoading || isLoadingToken}
      chain={chain}
      sx={sx}
      mainAvatarStyle={mainAvatarStyle}
    />
  );
};

export const TokenAvatarBase: React.FC<{
  token?: StaticToken;
  chain?: Chain;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
  mainAvatarStyle?: SxProps<Theme>;
}> = ({ token, chain, isLoading, sx, mainAvatarStyle }) => {
  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        chain && !isLoading ? (
          <SmallAvatar src={chain.logoURI} alt={chain.name} sx={{border: 'none'}}>
            {chain.name[0]}
          </SmallAvatar>
        ) : (
          <SmallAvatarSkeleton />
        )
      }
      sx={sx}
    >
      {isLoading ? (
        <Skeleton width={44} height={44} variant="circular" />
      ) : (
        <Avatar src={token?.logoURI} alt={token?.symbol} sx={mainAvatarStyle}>
          {token?.symbol?.[0]}
        </Avatar>
      )}
    </Badge>
  );
};

export const TokenAvatar: React.FC<{
  token?: StaticToken;
  chain?: Chain;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
  mainAvatarStyle?: SxProps<Theme>;
}> = ({ token, chain, isLoading, sx, mainAvatarStyle }) => {
  if (!chain || !token?.logoURI) {
    return <TokenAvatarFallback token={token} isLoading={isLoading} sx={sx} mainAvatarStyle={mainAvatarStyle} />;
  }
  return (
    <TokenAvatarBase
      token={token}
      chain={chain}
      isLoading={isLoading}
      sx={sx}
      mainAvatarStyle={mainAvatarStyle}
    />
  );
};

export const TokenAvatarDefault: React.FC<{
  sx?: SxProps<Theme>;
}> = ({ sx }) => {
  return (
    <Badge
      overlap="circular"
      className='preventHoverEffect'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={<AvatarDefaultBadge width={16} height={16} sx={{border: '2px solid #2B3037', background: '#4C585F'}} />}
      sx={sx}
    >
      <AvatarDefault width={44} height={44} sx={{background: '#4C585F'}} className='preventHoverEffect' />
    </Badge>
  );
};
