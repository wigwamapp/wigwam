import AccessTimeIcon from '@mui/icons-material/AccessTimeFilled';
import clockIcon from '../../../../src/app/icons/clock.svg'
import EvStationIcon from '@mui/icons-material/EvStation';
import LayersIcon from '@mui/icons-material/Layers';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Box, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IconTypography } from './RouteCard.style';
import type { RouteCardEssentialsProps } from './types';
import { getFeeCostsBreakdown, getGasCostsBreakdown } from './utils';

export const RouteCardEssentials: React.FC<RouteCardEssentialsProps> = ({
  route,
  dense,
}) => {
  const { t } = useTranslation();
  const executionTimeMinutes = Math.ceil(
    route.steps
      .map((step) => step.estimate.executionDuration)
      .reduce((duration, x) => duration + x, 0) / 60,
  );
  const gasCostUSD = parseFloat(route.gasCostUSD ?? '') || 0.01;
  const gasCosts = getGasCostsBreakdown(route);
  const feeCosts = getFeeCostsBreakdown(route, false);
  return (
    <Box display="flex" justifyContent={'space-between'} flex={1} mt={2}>
      <Tooltip
        title={
          <Box component="span">
            {t(`tooltip.estimatedNetworkFee`)}
            {gasCosts.map((gas, index) => (
              <Typography
                fontSize={12}
                fontWeight="500"
                key={`${gas.token.address}${index}`}
              >
                {gas.amount?.toFixed(9)} {gas.token.symbol} (
                {t(`format.currency`, { value: gas.amountUSD })})
              </Typography>
            ))}
          </Box>
        }
        placement="top"
        enterDelay={400}
        arrow
      >
        <Box display="flex" alignItems="center" mr={dense ? 0 : 2}>
          <IconTypography>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
              <g clipPath="url(#clip0_1562_28916)">
              <path d="M15.6845 5.135L15.6934 5.12611L12.3867 1.81944L11.4445 2.76167L13.3201 4.63722C12.4845 4.95722 11.889 5.75722 11.889 6.70833C11.889 7.935 12.8845 8.93056 14.1112 8.93056C14.4312 8.93056 14.7245 8.85944 15.0001 8.74389V15.1528C15.0001 15.6417 14.6001 16.0417 14.1112 16.0417C13.6223 16.0417 13.2223 15.6417 13.2223 15.1528V11.1528C13.2223 10.175 12.4223 9.375 11.4445 9.375H10.5556V3.15278C10.5556 2.175 9.75564 1.375 8.77786 1.375H3.44453C2.46675 1.375 1.66675 2.175 1.66675 3.15278V17.375H10.5556V10.7083H11.889V15.1528C11.889 16.3794 12.8845 17.375 14.1112 17.375C15.3379 17.375 16.3334 16.3794 16.3334 15.1528V6.70833C16.3334 6.095 16.0845 5.535 15.6845 5.135ZM8.77786 7.59722H3.44453V3.15278H8.77786V7.59722ZM14.1112 7.59722C13.6223 7.59722 13.2223 7.19722 13.2223 6.70833C13.2223 6.21944 13.6223 5.81944 14.1112 5.81944C14.6001 5.81944 15.0001 6.21944 15.0001 6.70833C15.0001 7.19722 14.6001 7.59722 14.1112 7.59722Z" fill="#737C88"/>
              </g>
              <defs>
              <clipPath id="clip0_1562_28916">
              <rect width="18" height="18" fill="white" transform="translate(0 0.375)"/>
              </clipPath>
              </defs>
            </svg>
          </IconTypography>
          <Typography
            fontSize={14}
            color="text.primary"
            fontWeight="500"
            lineHeight={1}
          >
            {t(`format.currency`, { value: gasCostUSD })}
          </Typography>
        </Box>
      </Tooltip>
      <Tooltip
        title={
          <Box component="span">
            {t(`tooltip.additionalProviderFee`)}
            {feeCosts.map((fee, index) => (
              <Typography
                fontSize={12}
                fontWeight="500"
                key={`${fee.token.address}${index}`}
              >
                {fee.amount?.toFixed(9)} {fee.token.symbol} (
                {t(`format.currency`, { value: fee.amountUSD })})
              </Typography>
            ))}
          </Box>
        }
        placement="top"
        enterDelay={400}
        arrow
      >
        <Box display="flex" alignItems="center" mr={dense ? 0 : 2}>
          <IconTypography>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <g clipPath="url(#clip0_1562_28921)">
            <path fillRule="evenodd" clipRule="evenodd" d="M9 1.375C4.58172 1.375 1 4.95672 1 9.375C1 13.7933 4.58172 17.375 9 17.375C13.4183 17.375 17 13.7933 17 9.375C17 4.95672 13.4183 1.375 9 1.375ZM8.75848 13.107V13.921H9.34087V13.1075C9.81053 13.083 10.2201 12.9966 10.5696 12.8485C10.991 12.6686 11.3129 12.4165 11.5355 12.0922C11.7604 11.7654 11.874 11.3796 11.8764 10.9345C11.874 10.6315 11.8184 10.3627 11.7095 10.1284C11.6029 9.894 11.4526 9.6904 11.2585 9.51758C11.0643 9.34476 10.8347 9.19916 10.5696 9.08079C10.3044 8.96242 10.0132 8.86772 9.69598 8.7967L9.34087 8.71178V6.94236C9.58093 6.97349 9.7798 7.0471 9.93746 7.16317C10.1529 7.32179 10.2748 7.54433 10.3032 7.83079H11.7769C11.7698 7.39755 11.6538 7.01639 11.4289 6.68732C11.204 6.35825 10.8892 6.10139 10.4843 5.91673C10.1504 5.76353 9.76928 5.67388 9.34087 5.64778V4.83008H8.75848V5.6509C8.35286 5.68053 7.98355 5.76914 7.65052 5.91673C7.23386 6.10139 6.90597 6.35825 6.66686 6.68732C6.43012 7.01639 6.31293 7.4011 6.3153 7.84144C6.31293 8.37885 6.4893 8.80617 6.84442 9.1234C7.19953 9.44064 7.68367 9.67383 8.29683 9.82298L8.75848 9.93891V11.81C8.60179 11.7914 8.45619 11.7565 8.32169 11.7051C8.11336 11.6222 7.94645 11.5003 7.82098 11.3393C7.69787 11.176 7.62803 10.9724 7.61146 10.7285H6.12354C6.13537 11.2517 6.26203 11.6909 6.50351 12.046C6.74735 12.3987 7.08589 12.6651 7.51913 12.845C7.8802 12.9941 8.29331 13.0815 8.75848 13.107ZM9.34087 11.8064C9.47696 11.788 9.60125 11.7566 9.71373 11.7122C9.90786 11.6364 10.0582 11.5311 10.1647 11.3961C10.2713 11.2612 10.3245 11.1061 10.3245 10.9309C10.3245 10.7676 10.276 10.6303 10.1789 10.519C10.0842 10.4077 9.94456 10.313 9.7599 10.2349C9.63857 10.1829 9.4989 10.1341 9.34087 10.0884V11.8064ZM8.75848 8.56621V6.94492C8.6345 6.96232 8.52323 6.99128 8.42467 7.03178C8.25185 7.10044 8.11927 7.19632 8.02694 7.31942C7.93698 7.44253 7.892 7.58221 7.892 7.73846C7.88727 7.86867 7.91449 7.9823 7.97368 8.07937C8.03523 8.17643 8.11927 8.26048 8.22581 8.3315C8.33234 8.40015 8.45545 8.46052 8.59513 8.51261C8.64821 8.5315 8.70266 8.54937 8.75848 8.56621Z" fill="#737C88"/>
            </g>
            <defs>
            <clipPath id="clip0_1562_28921">
            <rect width="18" height="18" fill="white" transform="translate(0 0.375)"/>
            </clipPath>
            </defs>
            </svg>
          </IconTypography>
          <Typography
            fontSize={14}
            color="text.primary"
            fontWeight="500"
            lineHeight={1}
          >
            {t(`format.currency`, {
              value: feeCosts.reduce(
                (sum, feeCost) => sum + feeCost.amountUSD,
                0,
              ),
            })}
          </Typography>
        </Box>
      </Tooltip>
      <Tooltip
        title={t(`tooltip.estimatedTime`)}
        placement="top"
        enterDelay={400}
        arrow
      >
        <Box display="flex" alignItems="center" mr={dense ? 0 : 2}>
          <IconTypography>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <g clipPath="url(#clip0_1562_28928)">
            <path d="M12.392 5.983C11.456 5.047 10.232 4.575 9 4.575V9.375L5.608 12.767C7.48 14.639 10.52 14.639 12.4 12.767C14.272 10.895 14.272 7.855 12.392 5.983ZM9 1.375C4.584 1.375 1 4.959 1 9.375C1 13.791 4.584 17.375 9 17.375C13.416 17.375 17 13.791 17 9.375C17 4.959 13.416 1.375 9 1.375ZM9 15.775C5.464 15.775 2.6 12.911 2.6 9.375C2.6 5.839 5.464 2.975 9 2.975C12.536 2.975 15.4 5.839 15.4 9.375C15.4 12.911 12.536 15.775 9 15.775Z" fill="#737C88"/>
            </g>
            <defs>
            <clipPath id="clip0_1562_28928">
            <rect width="18" height="18" fill="white" transform="translate(0 0.375)"/>
            </clipPath>
            </defs>
          </svg>
          </IconTypography>
          <Typography
            fontSize={14}
            color="text.primary"
            fontWeight="500"
            lineHeight={1}
          >
            {t('main.estimatedTime', {
              value: executionTimeMinutes,
            })}
          </Typography>
        </Box>
      </Tooltip>
      <Tooltip
        title={t(`tooltip.numberOfSteps`)}
        placement="top"
        enterDelay={400}
        arrow
      >
        <Box display="flex" alignItems="center">
          <IconTypography>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <g clipPath="url(#clip0_1562_28933)">
            <path d="M17.0002 12.137C16.7629 12.2578 16.5277 12.3786 16.2904 12.4972C15.462 12.9167 14.6336 13.3362 13.8052 13.7557C13.4959 13.9125 13.1845 14.0693 12.8752 14.2282C12.854 14.2387 12.8328 14.2493 12.8137 14.2599C12.7925 14.2705 12.7692 14.2811 12.748 14.2938C12.5362 14.4019 12.3222 14.5099 12.1103 14.618C11.6463 14.8531 11.1802 15.0904 10.7163 15.3256C10.1421 15.6159 9.56371 15.9019 8.9938 16.2006C8.52982 15.9633 8.06583 15.726 7.60185 15.4909C7.02982 15.2006 6.45566 14.9082 5.88363 14.618C5.71626 14.5332 5.54889 14.4485 5.37939 14.3616C5.06795 14.2027 4.75439 14.0438 4.44295 13.8849C3.63151 13.4739 2.82219 13.0629 2.01287 12.6519C1.676 12.4824 1.34126 12.3044 1.00439 12.1328C1.3116 11.976 1.62092 11.8214 1.92812 11.6646C2.80524 11.2197 3.68448 10.7748 4.56372 10.3298C4.69295 10.2642 4.82219 10.1985 4.95143 10.1328C5.59973 10.4612 6.24592 10.7896 6.89422 11.118C7.5171 11.4337 8.13575 11.7578 8.76075 12.065C8.85609 12.1116 8.94719 12.1434 9.05736 12.1286C9.12515 12.1201 9.18448 12.0926 9.2438 12.0629C9.32431 12.0226 9.40693 11.9803 9.48744 11.94C9.81795 11.7726 10.1506 11.6032 10.4832 11.4358C11.2756 11.0332 12.068 10.6328 12.8603 10.2303C12.9239 10.1985 12.9874 10.1667 13.051 10.1349C13.5319 10.3786 14.0107 10.6222 14.4917 10.8659C15.3222 11.2875 16.1633 11.7112 17.0002 12.137Z" fill="#737C88"/>
            <path d="M16.9958 6.22272C16.7585 6.34137 16.5233 6.46213 16.286 6.58289C15.4576 7.00238 14.6292 7.42187 13.8008 7.84136C13.4894 7.99814 13.178 8.15704 12.8665 8.31382C12.8496 8.3223 12.8305 8.33289 12.8136 8.34136C12.7903 8.35196 12.7669 8.36467 12.7436 8.37738C12.5318 8.48543 12.322 8.59136 12.1102 8.69942C11.6441 8.93458 11.178 9.17187 10.7119 9.40916C10.1398 9.69942 9.55932 9.98543 8.98941 10.282C8.52542 10.0448 8.06144 9.80958 7.59746 9.57441C7.0233 9.28416 6.45127 8.99179 5.87712 8.69942C5.70974 8.61467 5.54237 8.52992 5.375 8.44518C5.06356 8.28628 4.75 8.12738 4.43856 7.96848C3.62712 7.55747 2.8178 7.14645 2.00847 6.73543C1.67161 6.56594 1.33686 6.38798 1 6.21636C1.05508 6.18882 1.10805 6.16128 1.16314 6.13374C1.87288 5.77357 2.58263 5.41552 3.29025 5.05535C4.15254 4.61679 5.01695 4.18035 5.87924 3.74179C6.62076 3.36679 7.36229 2.98967 8.10381 2.61467C8.40042 2.46425 8.70339 2.32654 8.99788 2.17188C9.22457 2.28416 9.44915 2.39857 9.67585 2.51298C10.3835 2.87315 11.0932 3.22908 11.8008 3.58925C12.6631 4.02569 13.5275 4.46213 14.3898 4.90069C15.1314 5.27569 15.8729 5.65069 16.6123 6.02781C16.7415 6.09348 16.8686 6.15916 16.9958 6.22272Z" fill="#737C88"/>
            </g>
            <defs>
            <clipPath id="clip0_1562_28933">
            <rect width="18" height="18" fill="white" transform="translate(0 0.375)"/>
            </clipPath>
            </defs>
          </svg>
          </IconTypography>
          <Typography
            fontSize={14}
            color="text.primary"
            fontWeight="500"
            lineHeight={1}
          >
            {route.steps.length}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};
