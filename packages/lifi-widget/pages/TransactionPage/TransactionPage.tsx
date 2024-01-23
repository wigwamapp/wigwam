import type { ExchangeRateUpdateParams } from "@lifi/sdk";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import type { BottomSheetBase } from "../../components/BottomSheet";
import { ContractComponent } from "../../components/ContractComponent";
import { GasMessage } from "../../components/GasMessage";
import { Insurance } from "../../components/Insurance";
import { getStepList } from "../../components/Step";
import {
  useNavigateBack,
  useRouteExecution,
  useWidgetEvents,
} from "../../hooks";
import { FormKey, useWidgetConfig } from "../../providers";
import { RouteExecutionStatus, useHeaderStoreContext } from "../../stores";
import { WidgetEvent } from "../../types/events";
import { formatTokenAmount } from "../../utils";
import type { ExchangeRateBottomSheetBase } from "./ExchangeRateBottomSheet";
import { ExchangeRateBottomSheet } from "./ExchangeRateBottomSheet";
import {
  StartInsurableTransactionButton,
  StartTransactionButton,
} from "./StartTransactionButton";
import { StatusBottomSheet } from "./StatusBottomSheet";
import {
  TokenValueBottomSheet,
  getTokenValueLossThreshold,
} from "./TokenValueBottomSheet";
import { Container } from "./TransactionPage.style";
import { calcValueLoss } from "./utils";
import backIcon from '../../../../src/app/icons/back.svg';


export const TransactionPage: React.FC = () => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const emitter = useWidgetEvents();
  const { navigateBack } = useNavigateBack();
  const {
    subvariant,
    insurance,
    contractComponent,
    contractSecondaryComponent,
    onBeforeTransaction
  } = useWidgetConfig();
  const { state, search } = useLocation();
  const headerStoreContext = useHeaderStoreContext();
  const stateRouteId = state?.routeId;
  const [routeId, setRouteId] = useState<string>(stateRouteId);

  const navigate = useNavigate()

  if (!stateRouteId) {
    return null
  }

  const tokenValueBottomSheetRef = useRef<BottomSheetBase>(null);
  const exchangeRateBottomSheetRef = useRef<ExchangeRateBottomSheetBase>(null);

  const onAcceptExchangeRateUpdate = (
    resolver: (value: boolean) => void,
    data: ExchangeRateUpdateParams,
  ) => {
    exchangeRateBottomSheetRef.current?.open(resolver, data);
  };

  const { route, status, executeRoute, restartRoute, deleteRoute } =
    useRouteExecution({
      routeId: routeId,
      onAcceptExchangeRateUpdate,
    });

  useEffect(() => {
    if (route && subvariant !== "nft") {
      const transactionType =
        route.fromChainId === route.toChainId ? "Swap" : "Bridge";
      return headerStoreContext
        .getState()
        .setTitle(
          status === RouteExecutionStatus.Idle
            ? t(`button.review${transactionType}`)
            : t(`header.${transactionType.toLowerCase() as "swap" | "bridge"}`),
        );
    }
  }, [headerStoreContext, route, status, subvariant, t]);

  useEffect(() => {
    if (status === RouteExecutionStatus.Idle) {
      emitter.emit(WidgetEvent.ReviewTransactionPageEntered, route);
      handleStartClick()
    }
    // We want to emit event only when the page is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (!route) {
    return null;
  }

  const tokenValueLossThresholdExceeded = getTokenValueLossThreshold(route);

  const handleExecuteRoute = () => {
    if (tokenValueBottomSheetRef.current?.isOpen()) {
      emitter.emit(WidgetEvent.RouteHighValueLoss, {
        fromAmountUsd: route.fromAmountUSD,
        gasCostUSD: route.gasCostUSD,
        toAmountUSD: route.toAmountUSD,
        valueLoss: calcValueLoss(route),
      });
    }
    tokenValueBottomSheetRef.current?.close();
    if (onBeforeTransaction) {
      onBeforeTransaction(route)
    }
    executeRoute();
    setValue(FormKey.FromAmount, "");
    setValue(FormKey.FromToken, "");
    setValue(FormKey.ToToken, "");
    // if (subvariant === "nft") {
    //   setValue(FormKey.FromToken, "");
    //   setValue(FormKey.ToToken, "");
    // }
  };

  const handleStartClick = async () => {
    if (status === RouteExecutionStatus.Idle) {
      if (tokenValueLossThresholdExceeded && subvariant !== "nft") {
        tokenValueBottomSheetRef.current?.open();
      } else {
        handleExecuteRoute();
      }
    }
    if (status === RouteExecutionStatus.Failed) {
      restartRoute();
    }
  };

  const handleRemoveRoute = () => {
    if (status === RouteExecutionStatus.Idle || status === RouteExecutionStatus.Failed) {
      deleteRoute();
    }
    navigateBack();
  };

  const getButtonText = (): string => {
    switch (status) {
      case RouteExecutionStatus.Idle:
        switch (subvariant) {
          case "nft":
            return t("button.buyNow");
          case "refuel":
            return t("button.startBridging");
          default:
            const transactionType =
              route.fromChainId === route.toChainId ? "Swapping" : "Bridging";
            return t(`button.start${transactionType}`);
        }
      case RouteExecutionStatus.Failed:
        return t("button.tryAgain");
      default:
        return "";
    }
  };

  const insuredRoute = route.insurance?.state === "INSURED";
  const insurableRoute =
    insurance &&
    subvariant !== "refuel" &&
    status === RouteExecutionStatus.Idle &&
    route.insurance?.state === "INSURABLE";

  const insuranceAvailable = insuredRoute || insurableRoute;

  const StartButton = insurableRoute
    ? StartInsurableTransactionButton
    : StartTransactionButton;

  const getInsuranceCoverageId = () =>
    route.steps[0].execution?.process
      .filter((process) => process.type !== "TOKEN_ALLOWANCE")
      .find((process) => process.txHash)?.txHash ?? route.fromAddress;
  
  const getTxStatus = (status: RouteExecutionStatus) => {
    switch (status) {
      case (RouteExecutionStatus.Done):
        return (
          <div className='txStatus complete'>Complete</div>
        )
      case (RouteExecutionStatus.Pending):
        return (
          <div className='txStatus progress'>In Progress...</div>
        )
    }
  }

  useEffect(() => {
    return () => {
      if (status === 4) {
        deleteRoute()
      }
    }
  }, [status])



  return (
    <Container sx={{width: '500px !important', background: 'transparent', marginLeft: '0px', paddingTop: '0', height: 'calc(90vh - 58px)', overflowX: 'scroll', borderRight: '1px solid #21262A'}}>
      <div style={{display: 'flex',  justifyContent: 'flex-start', alignItems: 'center', marginBottom: '30px', position: 'fixed', paddingBottom: '10px', zIndex: '10', width: '100%', background: '#181a1f'}}>
        <img style={{marginRight: '24px', cursor: 'pointer'}} src={backIcon} onClick={() => navigate('/')}/>
        <Typography color={'#fff'} fontSize={16} sx={{fontWeight: '600 !important'}}>Swap</Typography>
        {/* {getTxStatus(status || RouteExecutionStatus.Pending)} */}
      </div>
      <div className="txSteps" style={{marginTop: '44px'}}>
        {getStepList(route, subvariant)}
      </div>
      {subvariant === "nft" ? (
        <ContractComponent mt={2}>
          {contractSecondaryComponent || contractComponent}
        </ContractComponent>
      ) : null}
      {insuranceAvailable ? (
        <Insurance
          mt={2}
          status={status}
          insurableRouteId={stateRouteId}
          feeAmountUsd={route.insurance.feeAmountUsd}
          insuredAmount={formatTokenAmount(
            route.toAmountMin,
            route.toToken.decimals,
          )}
          insuredTokenSymbol={route.toToken.symbol}
          insuranceCoverageId={getInsuranceCoverageId()}
          onChange={setRouteId}
        />
      ) : null}
      {
      // status === RouteExecutionStatus.Idle ||
      status === RouteExecutionStatus.Failed ? (
        <>
          <GasMessage mt={2} route={route} />
          <Box mt={2} display="flex">
            <StartButton
              text={getButtonText()}
              onClick={handleStartClick}
              route={route}
              insurableRouteId={stateRouteId}
            />
            {status === RouteExecutionStatus.Failed ? (
              <Tooltip
                title={t("button.removeTransaction")}
                placement="bottom-end"
                enterDelay={400}
                arrow
              >
                <Button
                  onClick={handleRemoveRoute}
                  sx={{
                    minWidth: 48,
                    marginLeft: 1,
                    borderRadius: '6px'
                  }}
                >
                  <DeleteIcon />
                </Button>
              </Tooltip>
            ) : null}
          </Box>
        </>
      ) : null}
      {status ? <StatusBottomSheet status={status} route={route} /> : null}
      {tokenValueLossThresholdExceeded && subvariant !== "nft" ? (
        <TokenValueBottomSheet
          route={route}
          ref={tokenValueBottomSheetRef}
          onContinue={handleExecuteRoute}
          onCancel={() => navigate('/')}
        />
      ) : null}
      <ExchangeRateBottomSheet ref={exchangeRateBottomSheetRef} />
    </Container>
  );
};
