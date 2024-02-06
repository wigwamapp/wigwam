/* eslint-disable react/no-array-index-key */
import type { LifiStep, TokenAmount } from '@lifi/sdk';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Card, CardTitle } from '../../components/Card';
import { StepActions } from '../../components/StepActions';
import { Token } from '../../components/Token';
import { useChains } from '../../hooks';
import { useWidgetConfig } from '../../providers';
import { shortenAddress } from '../../utils';
import { DestinationWalletAddress } from './DestinationWalletAddress';
import { GasStepProcess } from './GasStepProcess';
import { StepProcess } from './StepProcess';
import { StepTimer } from './StepTimer';

export const Step: React.FC<{
  step: LifiStep;
  fromToken?: TokenAmount;
  toToken?: TokenAmount;
  toAddress?: string;
  routeId: string;
}> = ({ step, fromToken, toToken, toAddress, routeId }) => {
  const { t } = useTranslation();
  const { getChainById } = useChains();
  const { subvariant } = useWidgetConfig();

  const stepHasError = step.execution?.process.some(
    (process) => process.status === 'FAILED',
  );

  const formattedToAddress = shortenAddress(toAddress);
  const toAddressLink = toAddress
    ? `${getChainById(step.action.toChainId)?.metamask
        .blockExplorerUrls[0]}address/${toAddress}`
    : undefined;

  return (
    <Card variant={stepHasError ? 'error' : 'default'}>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          background: 'transparent',
          border: 'none'
        }}
      >
        {/* <CardTitle flex={1}>{getCardTitle()}</CardTitle>
        <CardTitle sx={{ fontWeight: 500 }}>
          <StepTimer step={step} />
        </CardTitle> */}
      </Box>
      <Box py={1}>
        {fromToken ? <Token token={fromToken} py={1} /> : null}
        <StepActions step={step} py={1} dense />
        {step.execution?.process.map((process, index) => (
          <StepProcess key={index} step={step} process={process} routeId={routeId} />
        ))}
        {/* <GasStepProcess step={step} /> */}
        {formattedToAddress && toAddressLink ? (
          <DestinationWalletAddress
            step={step}
            toAddress={formattedToAddress}
            toAddressLink={toAddressLink}
          />
        ) : null}
        {toToken ? <Token token={toToken} py={1} /> : null}
      </Box>
    </Card>
  );
};
