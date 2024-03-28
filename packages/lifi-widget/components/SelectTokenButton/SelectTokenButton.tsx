import { ReactNode, useEffect } from "react";
import { Skeleton } from "@mui/material";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useChain, useSwapOnly, useToken } from "../../hooks";
import type { FormTypeProps } from "../../providers";
import { FormKeyHelper, FormKey, useWidgetConfig } from "../../providers";
import { navigationRoutes } from "../../utils";
import { Card, CardTitle } from "../Card";
import { TokenAvatar, TokenAvatarDefault } from "../TokenAvatar";
import { SelectTokenCardHeader } from "./SelectTokenButton.style";
import { useFormContext } from 'react-hook-form';

export const SelectTokenButton: React.FC<
  FormTypeProps & {
    compact: boolean;
  }
> = ({ formType, compact }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setValue } = useFormContext();

  const { disabledUI, subvariant } = useWidgetConfig();
  const swapOnly = useSwapOnly();
  const tokenKey = FormKeyHelper.getTokenKey(formType);
  const [chainId, tokenAddress] = useWatch({
    name: [FormKeyHelper.getChainKey(formType), tokenKey],
  });
  const [toToken] = useWatch({
    name: [
      FormKey.ToToken,
    ],
  });
  const { chain, isLoading: isChainLoading } = useChain(chainId);
  const { token, isLoading: isTokenLoading } = useToken(chainId, tokenAddress);

  useEffect(() => {
    if (formType === 'from' && !toToken) {
      setValue(FormKey.ToChain, chainId, { shouldTouch: true })
    }
  }, [chainId])

  const handleClick = () => {
    navigate(
      formType === "from"
        ? navigationRoutes.fromToken
        : subvariant === "refuel"
          ? navigationRoutes.toTokenNative
          : navigationRoutes.toToken,
    );
  };

  const isSelected = !!(chain && token);
  const onClick = !disabledUI?.includes(tokenKey) ? handleClick : undefined;
  const defaultPlaceholder =
    formType === "to" && subvariant === "refuel"
      ? t("main.selectChain")
      : formType === "to" && swapOnly
        ? "Network"
        : "Network";
  const cardTitle: ReactNode =
    formType === "from" && subvariant === "nft"
      ? t(`header.payWith`)
      : t(`main.${formType}`);
  return (
    <Card flex={1} onClick={onClick} sx={{border: 'none', background: 'none'}}>
      <CardTitle sx={{paddingLeft: '0px !important'}}>{cardTitle}</CardTitle>
      <div className="selectTokenButton" style={{background: '#22262A', borderRadius: '10px', marginTop: '8px', position: 'relative'}}>
        {chainId && tokenAddress && (isChainLoading || isTokenLoading) ? (
          <SelectTokenCardHeader
            avatar={<Skeleton variant="circular" width={44} height={44} />}
            title={<Skeleton variant="text" width={64} height={24} />}
            subheader={<Skeleton variant="text" width={64} height={16} />}
            compact={compact}
          />
        ) : (
          <SelectTokenCardHeader
            avatar={
              isSelected ? (
                <TokenAvatar token={token} chain={chain} mainAvatarStyle={{width: '44px', height: '44px'}} smallAvatarStyle={{width: '24px !important', height: '24px !important'}}/>
              ) : (
                  <TokenAvatarDefault />
              )
            }
            title={isSelected ? <span style={{fontWeight: '700', color: '#FFF'}}>{token.symbol}</span> : <span style={{fontWeight: '700', color: '#8D9C9E'}}>{defaultPlaceholder}</span>}
            subheader={
              isSelected ? <span style={{fontWeight: '800', fontSize: '14px', color: '#8D9C9E'}}>{chain.name}</span> : <span style={{fontWeight: '400', fontSize: '12px', color: '#8D9C9E'}}>and Token</span>
            }
            selected={isSelected}
            compact={compact}
          />
        )}
        <div className="swapArrowIcon" style={{position: 'absolute', right: '16px', bottom: 'calc(50% - 8px)'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M7.71191 6.15453L1.70191 0.144531L0.286912 1.55853L4.88691 6.15853L0.286912 10.7585L1.70191 12.1655L7.71191 6.15453Z" fill="#F8F9FD"/>
          </svg>
        </div> 
      </div>
    </Card>
  );
};
