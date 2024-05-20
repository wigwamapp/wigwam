import { Box, Container, Typography } from '@mui/material';
import type { FC } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { ChainSelect } from '../../components/ChainSelect';
import { TokenList } from '../../components/TokenList';
import {
  useContentHeight,
  useNavigateBack,
  useScrollableOverflowHidden,
  useSwapOnly,
} from '../../hooks';
import { useWidgetConfig, type FormTypeProps } from '../../providers';
import { SearchTokenInput } from './SearchTokenInput';
import type { ChangeEvent } from 'react';
import { Switch } from '../../components/Switch';

const minTokenListHeight = 360;

export const SelectTokenPage: FC<FormTypeProps> = ({ formType }) => {
  useScrollableOverflowHidden();
  const { navigateBack } = useNavigateBack();
  const headerRef = useRef<HTMLElement>(null);
  const contentHeight = useContentHeight();
  const [tokenListHeight, setTokenListHeight] = useState(0);
  const swapOnly = useSwapOnly();
  const { showOnlyVerified, hideVerifiedToggle, onShowFullList } = useWidgetConfig();

  useLayoutEffect(() => {
    setTokenListHeight(
      Math.max(
        contentHeight - (headerRef.current?.offsetHeight ?? 0),
        minTokenListHeight,
      ),
    );
  }, [contentHeight]);

  const hideChainSelect = swapOnly && formType === 'to';

  if (!onShowFullList) return;

  const onChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onShowFullList(checked)
  }

  return (
    <Container disableGutters>
      <Box pt={1} pb={2} px={3} ref={headerRef}>
        {!hideChainSelect ? <ChainSelect formType={formType} /> : null}
        {!hideVerifiedToggle && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
            <Typography
              fontSize={18}
              variant="subtitle1"
              color="text.primary"
              lineHeight="normal"
            >
              Show verified tokens
            </Typography>
            <Switch checked={showOnlyVerified} onChange={onChange} />
          </Box>
        )}
        <Box mt={!hideChainSelect ? 2 : 0}>
          <SearchTokenInput />
        </Box>
      </Box>
      <TokenList
        height={tokenListHeight}
        onClick={navigateBack}
        formType={formType}
      />
    </Container>
  );
};
