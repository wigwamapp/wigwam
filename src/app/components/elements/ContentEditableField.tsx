import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import classNames from "clsx";
import mergeRefs from "react-merge-refs";

export type ContentEditableFieldProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
  disabled?: boolean;
  label?: string;
  labelActions?: ReactNode;
  textareaClassName?: string;
  actions?: ReactNode;
  error?: boolean;
  errorMessage?: string;
};

const ContentEditableField = forwardRef<
  HTMLDivElement,
  ContentEditableFieldProps
>(
  (
    {
      className,
      onChange,
      value,
      disabled,
      onBlur,
      label,
      labelActions,
      textareaClassName,
      actions,
      error,
      errorMessage,
    },
    ref
  ) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const initialValueRef = useRef(value);

    useEffect(() => {
      const el = innerRef.current;

      if (el) el.textContent = initialValueRef.current ?? "";
      return () => {
        if (el) el.textContent = null;
      };
    }, []);

    return (
      <div className={classNames("flex flex-col", className)}>
        <div className="flex items-center justify-between px-4 mb-2 min-h-6">
          <div className="text-base text-brand-gray cursor-pointer flex align-center">
            {label}
          </div>

          {labelActions && (
            <>
              <span className="flex-1" />
              {labelActions}
            </>
          )}
        </div>

        <div className="relative w-full">
          <div
            ref={mergeRefs([innerRef, ref])}
            contentEditable
            onInput={(evt) => {
              const value = evt.currentTarget.textContent || null;
              onChange?.({ target: { value } } as any);
            }}
            onBlur={onBlur}
            className={classNames(
              "w-full",
              "h-28",
              "py-3 px-4",
              "box-border",
              "text-sm text-brand-light",
              "bg-black/20",
              "border border-brand-main/10",
              "rounded-[.625rem]",
              "overflow-auto",
              "outline-none",
              error && "!border-brand-redobject",
              !disabled && [
                "group-hover:bg-brand-main/5",
                "group-hover:border-brand-main/5",
              ],
              "focus:border-brand-main/[.15]",
              disabled && [
                "bg-brand-disabledbackground/20",
                "border-brand-main/5",
                "text-brand-disabledcolor placeholder-brand-disabledcolor",
              ],
              textareaClassName
            )}
            style={{
              wordBreak: "break-word",
            }}
            spellCheck={false}
          />

          {actions}
        </div>

        <div
          className={classNames(
            "max-h-0 overflow-hidden",
            "transition-[max-height] duration-200",
            error && errorMessage && "max-h-5"
          )}
        >
          <span className="block text-brand-redtext text-left pt-1 pl-4 text-xs">
            {errorMessage}
          </span>
        </div>
      </div>
    );
  }
);

export default ContentEditableField;
