import { Box, Container, ScopedCssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { PropsWithChildren } from 'react';
import { useWidgetConfig } from '../providers';
import type { WidgetVariant } from '../types';
import { ElementId, createElementId } from '../utils';

export const maxHeight = '100%';

export const AppExpandedContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: WidgetVariant }>(({ variant }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'start',
  flex: 1,
  height: variant === 'drawer' ? 'none' : maxHeight,
}));

const RelativeContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: WidgetVariant }>(({ theme, variant }) => ({
  position: 'relative',
  boxSizing: 'content-box',
  width: '100%',
  minWidth: 500,
  maxWidth: 500,
  maxHeight: variant === 'drawer' ? 'none' : maxHeight,
  height: maxHeight,
  background: theme.palette.background.default,
  overflow: 'auto',
  flex: 1,
  zIndex: 0,
}));

const CssBaselineContainer = styled(ScopedCssBaseline, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: WidgetVariant }>(({ variant }) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflowX: 'clip',
  margin: 0,
  width: '100%',
  maxHeight: variant === 'drawer' ? 'none' : maxHeight,
  overflowY: 'auto',
  scrollbarGutter: 'stable',
  height: '100%',
}));

export const FlexContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const AppContainer: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  // const ref = useRef<HTMLDivElement>(null);
  const { containerStyle, variant, elementId } = useWidgetConfig();
  return (
    <RelativeContainer
      sx={{...containerStyle, borderRight: '1px solid #21262A', borderRadius: '0px'}}
      variant={variant}
      id={createElementId(ElementId.RelativeContainer, elementId)}
    >
      <CssBaselineContainer
        id={createElementId(ElementId.ScrollableContainer, elementId)}
        variant={variant}
        enableColorScheme
        // ref={ref}
      >
        <FlexContainer disableGutters>{children}</FlexContainer>
      </CssBaselineContainer>
      {/* <ScrollToLocation elementRef={ref} /> */}
    </RelativeContainer>
  );
};

// export const ScrollToLocation: React.FC<{
//   elementRef: RefObject<HTMLElement>;
// }> = ({ elementRef }) => {
//   const { pathname } = useLocation();
//   useLayoutEffect(() => {
//     elementRef.current?.scrollTo(0, 0);
//   }, [elementRef, pathname]);
//   return null;
// };
