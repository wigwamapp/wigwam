import { memo, forwardRef, ReactNode, useEffect, useRef } from "react";
import classNames from "clsx";
import { mergeRefs } from "react-merge-refs";
import * as canvasTxt from "canvas-txt";
import { usePrevious } from "lib/react-hooks/usePrevious";

const canvasMultiplier = 3;

export type CanvasTextFieldProps = {
  value?: string;
  defaultValue?: string;
  label?: string;
  labelActions?: ReactNode;
  actions?: ReactNode;
  className?: string;
  canvasClassName?: string;
};

const CanvasTextField = memo(
  forwardRef<HTMLCanvasElement, CanvasTextFieldProps>(
    (
      {
        value,
        defaultValue,
        label,
        labelActions,
        actions,
        className,
        canvasClassName,
        ...rest
      },
      ref,
    ) => {
      const canvasRef = useRef<HTMLCanvasElement>();
      const prevValue = usePrevious(value ?? defaultValue);

      useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = 438 * canvasMultiplier;
          canvas.height = 110 * canvasMultiplier;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.setTransform(canvasMultiplier, 0, 0, canvasMultiplier, 0, 0);

            ctx.fillStyle = "#F8FCFD";

            if (prevValue !== (value ?? defaultValue)) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            const txt = value ?? defaultValue ?? "";

            canvasTxt.drawText(ctx, txt, {
              x: 16,
              y: 12,
              width: 406,
              height: 86,
              font: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
              fontSize: 16,
              align: "left",
              vAlign: "top",
              justify: false,
              debug: false,
              lineHeight: 20,
            });
          }
        }
      }, [defaultValue, prevValue, value]);

      return (
        <div className={classNames("flex flex-col", className)}>
          {(label || labelActions) && (
            <div className="flex items-center justify-between px-4 mb-2 min-h-6">
              {label && (
                <span className="text-base text-brand-gray cursor-pointer">
                  {label}
                </span>
              )}
              {labelActions}
            </div>
          )}
          <div
            className={classNames(
              "relative",
              "flex",
              "w-full h-28",
              "bg-black/20",
              "border border-brand-main/10",
              "rounded-[.625rem]",
              "transition-colors",
              "group-hover:bg-brand-main/5",
              "group-hover:border-brand-main/5",
            )}
          >
            <canvas
              width={438}
              height={110}
              ref={mergeRefs([ref, canvasRef])}
              className={classNames("w-full h-full", canvasClassName)}
              {...rest}
            />
            {actions}
          </div>
        </div>
      );
    },
  ),
);

export default CanvasTextField;
