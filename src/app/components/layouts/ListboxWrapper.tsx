import { ComponentProps, memo, ReactNode } from "react";
import classNames from "clsx";
import { Listbox, Transition } from "@headlessui/react";

type ListboxWrapperProps = ComponentProps<typeof Listbox> & {
  label?: ReactNode;
  button: ReactNode;
  children: ReactNode;
};

const ListboxWrapper = memo<ListboxWrapperProps>(
  ({ as = "div", className, label, button, children, ...rest }) => (
    <Listbox as={as} className={classNames("space-y-1", className)} {...rest}>
      {({ open }) => (
        <>
          {label && (
            <Listbox.Label className="block mb-6 text-2xl leading-5 font-medium">
              {label}
            </Listbox.Label>
          )}

          <div className="relative">
            <span className="inline-block w-full text-lg">{button}</span>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="absolute mt-1 w-full bg-black bg-opacity-75 backdrop-filter backdrop-blur z-20"
            >
              <Listbox.Options
                static
                className="max-h-60 py-1 text-base leading-6 shadow-xs overflow-auto focus-visible:outline-none"
              >
                {children}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
);

export default ListboxWrapper;
