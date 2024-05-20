import type { BoxProps, Theme } from '@mui/material';
import { Box, useMediaQuery } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { ReverseTokensButton } from '../components/ReverseTokensButton';
import { SelectTokenButton } from '../components/SelectTokenButton';
import { FormKey, useWidgetConfig } from '../providers';
import { DisabledUI, HiddenUI } from '../types';
import { useEffect } from 'react';
import { getClientProvider } from "core/client";
import { ERC721__factory } from "abi-types";
import { useWallet } from '../providers';

const DEV_NFT_ADDRESS = "0xe4aEA1A2127bFa86FEE9D43a8F471e1D41648A9e";
const DEV_NFT_CHAIN = 137;

const DISABLED_FEE_CHAINS = [59144]

export const SelectChainAndToken: React.FC<BoxProps> = (props) => {
  const prefersNarrowView = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  const { disabledUI, hiddenUI, subvariant, onChangeFee } = useWidgetConfig();
  const [fromChain, toChain, fromToken, toToken] = useWatch({
    name: [
      FormKey.FromChain,
      FormKey.ToChain,
      FormKey.FromToken,
      FormKey.ToToken,
    ],
  });

  const { account } = useWallet();

  useEffect(() => {
    const handleFromChainChange = async () => {
      if (!account.address) return

      if (DISABLED_FEE_CHAINS.includes(fromChain) && onChangeFee) {
        onChangeFee(undefined)
      } else if (onChangeFee) {
        const polygonProvider = getClientProvider(DEV_NFT_CHAIN).getUncheckedSigner(
          account.address,
        );
        const contract = ERC721__factory.connect(DEV_NFT_ADDRESS, polygonProvider);
        const nftBalance = await contract.balanceOf(account.address);
    
        if (Boolean(nftBalance)) {
          onChangeFee(undefined)
        } else {
          onChangeFee(0.01)
        }
      }
    }

    handleFromChainChange()
  }, [fromChain, account?.address])

  const hiddenReverse =
    subvariant === 'refuel' ||
    disabledUI?.includes(DisabledUI.FromToken) ||
    disabledUI?.includes(DisabledUI.ToToken) ||
    hiddenUI?.includes(HiddenUI.ToToken);

  const hiddenToToken =
    subvariant === 'nft' || hiddenUI?.includes(HiddenUI.ToToken);

  const isCompact = true ||
    fromChain &&
    toChain &&
    fromToken &&
    toToken &&
    !prefersNarrowView &&
    !hiddenToToken;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: isCompact ? 'row' : 'column', border: 'none', borderRadius: '10px', marginBottom: '24px' }}
      {...props}
    >
      <SelectTokenButton formType="from" compact={isCompact} />
      {!hiddenToToken ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none', borderRadius: '10px'
          }}
          m={!hiddenReverse ? -1.125 : 1}
        >
          {!hiddenReverse ? (
            <ReverseTokensButton vertical={!isCompact} />
          ) : null}
        </Box>
      ) : null}
      {!hiddenToToken ? (
        <SelectTokenButton formType="to" compact={isCompact} />
      ) : null}
    </Box>
  );
};
