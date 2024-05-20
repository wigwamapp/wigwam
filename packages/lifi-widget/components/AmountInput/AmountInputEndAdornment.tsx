import { InputAdornment, Skeleton } from '@mui/material';
import Big from 'big.js';
import { useFormContext, useWatch, useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useChains,
  useGasRecommendation,
  useTokenAddressBalance,
} from '../../hooks';
import type { FormTypeProps } from '../../providers';
import { FormKeyHelper } from '../../providers';
import { formatTokenAmount, formatInputAmount } from '../../utils';
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

  const {
    field: { onChange },
  } = useController({
    name: "fromAmount",
  });

  const handleValue = (percentage: number) => {
    const chain = getChainById(chainId);
    if (token?.amount) {
      let maxAmount: any = percentage === 100 ? token?.amount : new Big((Big(token?.amount).div(100).mul(percentage)).toFixed(token.decimals/2, 3));

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
      
      const formattedAmount = formatInputAmount(String(maxAmount), token?.decimals, true);
      onChange(formattedAmount)
    }
    // setValue('fromAmount', maxAmount || '', {
    //   shouldTouch: true,
    // });
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
        <Button onClick={() => handleValue(25)} className='hoverBlack' sx={{background: '#2C3036', borderRadius: '4px', padding: '6px', color: '#fff', marginRight: '8px', fontSize: '12px'}}>25%</Button>
        <Button onClick={() => handleValue(50)} className='hoverBlack' sx={{background: '#2C3036', borderRadius: '4px', padding: '6px', color: '#fff', marginRight: '8px', fontSize: '12px'}}>50%</Button>
        <Button onClick={() => handleValue(100)} className='hoverBlack' sx={{background: '#2C3036', borderRadius: '4px', padding: '6px', color: '#fff', fontSize: '12px'}}>{t('button.max')}</Button>
        </>
      ) : null}
    </InputAdornment>
  );
};
