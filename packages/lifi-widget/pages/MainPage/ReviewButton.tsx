import { useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { BaseTransactionButton } from "../../components/BaseTransactionButton";
import { useRoutes } from "../../hooks";
import { useWidgetConfig } from "../../providers";
import { useSetExecutableRoute, useGetExecutableRoute, useGetSelectedRoute, useSplitSubvariantStore } from "../../stores";
import { navigationRoutes } from "../../utils";

export const ReviewButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isValid, isValidating } = useFormState();
  const setExecutableRoute = useSetExecutableRoute();
  const currentRoute = useGetSelectedRoute();
  const { subvariant } = useWidgetConfig();
  const splitState = useSplitSubvariantStore((state) => state.state);

  const handleClick = async () => {
    if (currentRoute) {
      setExecutableRoute(currentRoute);
      navigate(`${pathname}?tab=transactionProcessing`, {
        state: { routeId: currentRoute.id },
      });

      // navigate(navigationRoutes.transactionExecution, {
      //   state: { routeId: currentRoute.id },
      // });
    }
  };

  const getButtonText = (): string => {
    if (currentRoute) {
      switch (subvariant) {
        case "nft":
          return t(`button.reviewPurchase`);
        case "refuel":
          return t(`button.reviewBridge`);
        default:
          const transactionType =
            currentRoute.fromChainId === currentRoute.toChainId
              ? "Swap"
              : "Bridge";
          return 'Start Swap';
      }
    } else {
      switch (subvariant) {
        case "nft":
          return t(`button.buy`);
        case "refuel":
          return t(`button.getGas`);
        case "split":
          if (splitState) {
            return t(`button.${splitState}`);
          }
          return "Start Swap";
        default:
          return "Start Swap";
      }
    }
  };

  return (
    <BaseTransactionButton
      text={getButtonText()}
      onClick={handleClick}
      disabled={currentRoute && (isValidating || !isValid) || !currentRoute}
    />
  );
};
