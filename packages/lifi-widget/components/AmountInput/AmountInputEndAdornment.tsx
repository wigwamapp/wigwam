import { InputAdornment, Skeleton } from '@mui/material';
import Big from 'big.js';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useChains,
  useGasRecommendation,
  useTokenAddressBalance,
} from '../../hooks';
import type { FormTypeProps } from '../../providers';
import { FormKeyHelper } from '../../providers';
import { formatTokenAmount } from '../../utils';
import { Button } from './AmountInputAdornment.style';

export const AmountInputEndAdornment = ({ formType }: FormTypeProps) => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const { getChainById } = useChains();
  const [chainId, tokenAddress] = useWatch({
    name: [
      FormKeyHelper.getChainKey(formType),
      FormKeyHelper.getTokenKey(formType),
    ],
  });
  const { data } = useGasRecommendation(chainId);
  const { token, isLoading } = useTokenAddressBalance(chainId, tokenAddress);

  const handleValue = (percentage: number) => {
    const chain = getChainById(chainId);
    let maxAmount: any = percentage === 100 ? token?.amount : Number(token?.amount) * (percentage / 100);
    if (
      chain?.nativeToken.address === tokenAddress &&
      data?.available &&
      data?.recommended
    ) {
      const tokenAmount = Big(token?.amount ?? 0);
      const recommendedAmount = Big(data.recommended.amount)
        .div(10 ** data.recommended.token.decimals)
        .div(2);
      if (tokenAmount.gt(recommendedAmount)) {
        maxAmount = formatTokenAmount(
          tokenAmount.minus(recommendedAmount).toString(),
        );
      }
    }

    setValue(FormKeyHelper.getAmountKey(formType), maxAmount || '', {
      shouldTouch: true,
    });
  };

  return (
    <InputAdornment position="end">
      {isLoading && tokenAddress ? (
        <Skeleton
          variant="rectangular"
          width={46}
          height={24}
          sx={{ borderRadius: 0.5 }}
        />
      ) : formType === 'from' && token?.amount ? (
        <>
        <Button onClick={() => handleValue(25)} sx={{background: '#2C3036', borderRadius: '4px', padding: '6px', color: '#fff', marginRight: '8px', fontSize: '12px'}}>25%</Button>
        <Button onClick={() => handleValue(50)} sx={{background: '#2C3036', borderRadius: '4px', padding: '6px', color: '#fff', marginRight: '8px', fontSize: '12px'}}>50%</Button>
        <Button onClick={() => handleValue(100)} sx={{background: '#2C3036', borderRadius: '4px', padding: '6px', color: '#fff', fontSize: '12px'}}>{t('button.max')}</Button>
        </>
      ) : null}
    </InputAdornment>
  );
};
