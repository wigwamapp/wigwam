import { Fragment, memo, ReactNode } from "react";
import classNames from "clsx";
import { Dialog, Portal, Transition } from "@headlessui/react";

type DialogWrapperProps = {
  displayed: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

const DialogWrapper = memo<DialogWrapperProps>(
  ({ displayed, onClose, children, title, description }) => (
    <Portal>
      <Transition appear show={displayed} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={onClose}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-75 backdrop-filter backdrop-blur" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                className={classNames(
                  "inline-block w-full max-w-md",
                  "p-6 my-8 overflow-hidden",
                  "text-left align-middle",
                  "transition-all transform"
                )}
              >
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="mb-4 text-3xl font-medium leading-6 text-gray-100"
                  >
                    {title}
                  </Dialog.Title>
                )}

                {description && (
                  <Dialog.Description
                    as="p"
                    className={classNames(
                      "mt-2 mb-12",
                      "text-sm text-gray-300"
                    )}
                  >
                    {description}
                  </Dialog.Description>
                )}

                {children}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </Portal>
  )
);

export default DialogWrapper;
