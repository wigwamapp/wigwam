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

    <Card>
        <FormControl fullWidth>
          <Input
            size="small"
            placeholder={'Search by Token name'}
            defaultValue=""
            sx={{
              borderRadius: '10px',
              background: '#16171C',
              color: '#717A7B',
              fontWeight: '400',
              fontSize: '14px'
            }}
            startAdornment={
              <InputAdornment position="end">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14.3142 16L11.2904 12.9086C8.26148 15.0508 4.08775 14.5268 1.6888 11.7032C-0.710145 8.87958 -0.533997 4.69833 2.09403 2.0843C4.72136 -0.530872 8.92492 -0.706861 11.7638 1.67946C14.6028 4.06578 15.1298 8.21817 12.9762 11.2316L16 14.323L14.3154 15.9988L14.3142 16ZM7.14792 2.3711C4.88868 2.3706 2.93955 3.94821 2.4806 6.14882C2.02166 8.34942 3.17904 10.5682 5.25203 11.4618C7.32501 12.3554 9.74385 11.6782 11.0441 9.84022C12.3443 8.00226 12.1685 5.50868 10.6232 3.86919L11.344 4.5803L10.5315 3.77438L10.5172 3.76015C9.62576 2.86792 8.41246 2.36771 7.14792 2.3711Z" fill="#717A7B"/>
                </svg>
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
