import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { FormKey } from '../../providers';
import { Input } from './SearchTokenInput.style';

export const SearchTokenInput = () => {
  const { t } = useTranslation();
  const { register, setValue } = useFormContext();

  useEffect(
    () => () => {
      setValue(FormKey.TokenSearchFilter, '');
    },
    [setValue],
  );

  return (
    <div className='searchInputWrapper'>

    <Card sx={{
      borderRadius: '10px',
      border: '1px solid #272C30',
      background: '#16171C',
      color: '#717A7B',
      fontSize: '14px'
    }}>
        <FormControl fullWidth>
          <Input
            size="small"
            placeholder={t(`main.tokenSearch`) as string}
            defaultValue=""
            startAdornment={
              <InputAdornment position="end">
                <SearchIcon sx={{fill: '#717A7B'}} />
              </InputAdornment>
            }
            inputProps={{
              inputMode: 'search',
              ...register(FormKey.TokenSearchFilter),
            }}
            autoComplete="off"
          />
        </FormControl>
    </Card>
    </div>
  );
};
