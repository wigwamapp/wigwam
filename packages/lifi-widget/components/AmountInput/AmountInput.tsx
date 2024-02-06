import type { Token } from '@lifi/sdk';
import type { BoxProps } from '@mui/material';
import type { ChangeEvent, ReactNode } from 'react';
import { Typography } from '@mui/material'
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useToken } from '../../hooks';
import type { FormTypeProps } from '../../providers';
import { FormKeyHelper, useWidgetConfig } from '../../providers';
import { DisabledUI } from '../../types';
import { fitInputText, formatInputAmount } from '../../utils';
import { Card, CardTitle } from '../Card';
import {
  FormControl,
  Input,
  maxInputFontSize,
  minInputFontSize,
} from './AmountInput.style';
import { AmountInputEndAdornment } from './AmountInputEndAdornment';
import { AmountInputStartAdornment } from './AmountInputStartAdornment';
import { FormPriceHelperText } from './FormPriceHelperText';
import { useGetSelectedRoute } from "../../stores";

export const AmountInput: React.FC<FormTypeProps & BoxProps> = ({
  formType,
  readOnly = false,
  ...props
}) => {
  const { disabledUI } = useWidgetConfig();
  const [chainId, tokenAddress] = useWatch({
    name: [
      FormKeyHelper.getChainKey(formType),
      FormKeyHelper.getTokenKey(formType),
    ],
  });
  const { token } = useToken(chainId, tokenAddress);
  const disabled = disabledUI?.includes(DisabledUI.FromAmount);
  return (
    <AmountInputBase
      sx={{borderRadius: '10px !important'}}
      formType={formType}
      token={token}
      startAdornment={<AmountInputStartAdornment formType={formType} />}
      endAdornment={
        !disabled ? <AmountInputEndAdornment formType={formType} /> : undefined
      }
      bottomAdornment={<FormPriceHelperText formType={formType} />}
      disabled={disabled || readOnly}
      {...props}
    />
  );
};

export const AmountInputBase: React.FC<
  FormTypeProps &
    BoxProps & {
      token?: Token;
      startAdornment?: ReactNode;
      endAdornment?: ReactNode;
      bottomAdornment?: ReactNode;
      disabled?: boolean;
    }
> = ({
  formType,
  token,
  startAdornment,
  endAdornment,
  bottomAdornment,
  disabled,
  ...props
}) => {
  const { t } = useTranslation();
  const amountKey = FormKeyHelper.getAmountKey(formType);
  const {
    field: { onChange, onBlur, value },
  } = useController({
    name: amountKey,
  });

  const {
    field: { onChange: onOutChange },
  } = useController({
    name: "toAmount",
  });
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (amountKey === "fromAmount" && !value) {
      onOutChange('')
    }
  }, [value])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    const formattedAmount = formatInputAmount(value, token?.decimals, true);
    onChange(formattedAmount);
  };

  const handleBlur = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    const formattedAmount = formatInputAmount(value, token?.decimals);
    onChange(formattedAmount);
    onBlur();
  };

  useLayoutEffect(() => {
    if (ref.current) {
      fitInputText(maxInputFontSize, minInputFontSize, ref.current);
    }
  }, [value, ref]);

  const currentRoute = useGetSelectedRoute();

  return (
    <Card {...props} sx={{border: 'none', background: 'none', borderRadius: '10px !important', marginBottom: '24px'}}>
      <Typography sx={{paddingTop: '0px', paddingLeft: '0px !important', display: 'flex', justifyContent: formType === 'to' ? 'space-between' : 'flex-start'}}><span>{formType === "to" ? "You receive" : t('main.fromAmount')}</span> {(formType === "to" && currentRoute && value) && (<span style={{display: 'flex', fontWeight: '500'}}>via <img style={{width: '24px', height: '24px', borderRadius: '100%', margin: '0 4px 0 8px'}} src={currentRoute.steps[0].toolDetails.logoURI} /> <span style={{color: '#fff', }}>{currentRoute.steps[0].toolDetails.name}</span></span>)}</Typography>
      <div style={{background: '#16171C', borderRadius: '10px', marginTop: '8px', border: '1px solid #272C30'}}>
      <FormControl fullWidth sx={{cursor: 'text'}} onClick={() => ref.current?.focus()}>
        <Input
          inputRef={ref}
          size="small"
          autoComplete="off"
          placeholder="0"
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          inputProps={{
            inputMode: 'decimal',
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          value={value}
          name={amountKey}
          disabled={disabled}
          sx={{fontSize: '20px !important', fontWeight: '500'}}
          required
        />
        {bottomAdornment}
      </FormControl>
      </div>
    </Card>
  );
};
