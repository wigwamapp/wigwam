import { FormControl as MuiFormControl, InputBase } from '@mui/material';
import { inputBaseClasses } from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';

export const maxInputFontSize = 18;
export const minInputFontSize = 14;

export const FormControl = styled(MuiFormControl)(({ theme }) => ({
  padding: theme.spacing(1.5, 2, 1.5, 0),
}));

export const Input = styled(InputBase)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 500,
  boxShadow: 'none',
  // padding: theme.spacing(2, 2, 2, 0),
  [`.${inputBaseClasses.input}`]: {
    height: 32,
    padding: theme.spacing(0, 0, 0, 2),
    fontSize: '20px !important'
  },
  '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
    {
      WebkitAppearance: 'none',
      margin: 0,
    },
  '& input[type="number"]': {
    MozAppearance: 'textfield',
  },
  [`&.${inputBaseClasses.disabled}`]: {
    color: 'inherit',
  },
  [`.${inputBaseClasses.input}.${inputBaseClasses.disabled}`]: {
    WebkitTextFillColor: 'unset',
  },
}));
