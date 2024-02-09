import { useWatch } from 'react-hook-form';
import { useChain, useToken } from '../../hooks';
import type { FormTypeProps } from '../../providers';
import { FormKeyHelper } from '../../providers';
import { TokenAvatar, TokenAvatarDefault } from '../TokenAvatar';

export const AmountInputStartAdornment: React.FC<FormTypeProps> = ({
  formType,
}) => {
  const [chainId, tokenAddress] = useWatch({
    name: [
      FormKeyHelper.getChainKey(formType),
      FormKeyHelper.getTokenKey(formType),
    ],
  });

  const { chain } = useChain(chainId);
  const { token } = useToken(chainId, tokenAddress);
  const isSelected = !!(chain && token);

  return isSelected ? (
    <TokenAvatar token={token} chain={chain} sx={{ marginLeft: 2 }} mainAvatarStyle={{width: '36px', height: '36px'}} />
  ) : (
    <TokenAvatarDefault sx={{ marginLeft: 2 }} avatarSx={{width: '36px !important', height: '36px !important'}} />
  );
};
