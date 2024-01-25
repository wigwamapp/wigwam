import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom'
import { ActiveTransactions } from '../../components/ActiveTransactions';
import { AmountInput } from '../../components/AmountInput';
import { ContractComponent } from '../../components/ContractComponent';
import { GasRefuelMessage } from '../../components/GasMessage';
import { Routes } from '../../components/Routes';
import { SelectChainAndToken } from '../../components/SelectChainAndToken';
import {
  SendToWallet,
  SendToWalletButton,
} from '../../components/SendToWallet';
import { useExpandableVariant } from '../../hooks';
import { useWidgetConfig } from '../../providers';
import { MainGasMessage } from './MainGasMessage';
import { FormContainer } from './MainPage.style';
import { ReviewButton } from './ReviewButton';

export const MainPage: React.FC = () => {
  const expandable = useExpandableVariant();
  const { subvariant, contractComponent } = useWidgetConfig();
  const nft = subvariant === 'nft';

  const location = useLocation();

  return (
    <FormContainer disableGutters>
      
      {(!location.search.includes("transactionHistory") && !location.search.includes("transactionDetails") && !location.search.includes("transactionProcessing")) ? <ActiveTransactions ml={0} mx={3} mt={1} mb={1} /> : null }
      {/* {nft ? (
        <ContractComponent mx={3} mt={1} mb={1}>
          {contractComponent}
        </ContractComponent>
      ) : null} */}
      <SelectChainAndToken mt={1} mx={3} mb={2} ml={0} />
      {!nft ? <AmountInput formType="from" mx={3} mb={2} ml={0} /> : null}
      {!nft ? <AmountInput formType="to" readOnly={true} mx={3} mb={2} ml={0} /> : null}
      {!expandable ? <Routes mx={3} mb={2} /> : null}
      <SendToWalletButton />
      <SendToWallet mx={3} mb={2} ml={0} />
      <GasRefuelMessage mx={3} mb={2} ml={0} />
      <MainGasMessage mx={3} mb={2} ml={0} />
      <Box display="flex" mx={3} mb={1} ml={0}>
        <ReviewButton />
      </Box>
    </FormContainer>
  );
};
