import {
  FC,
  Fragment,
  memo,
  useCallback,
  useMemo,
  useState,
  useRef,
} from "react";
import classNames from "clsx";
import { Dialog, Transition } from "@headlessui/react";

import {
  getProfileId,
  getAllProfiles,
  addProfile,
  setProfileId,
} from "lib/ext/profile";
import { TReplace } from "lib/ext/i18n/react";
import PageLayout from "app/components/layouts/PageLayout";
import Heading from "app/components/atoms/Heading";
import AutoIcon from "app/components/atoms/AutoIcon";

const Profiles: FC = () => {
  const currentProfileId = useMemo(() => getProfileId(), []);
  const allProfiles = useMemo(() => getAllProfiles(), []);

  const [adding, setAdding] = useState(false);

  const handleCancelAdding = useCallback(() => {
    setAdding(false);
  }, [setAdding]);

  const handleAdd = useCallback((name: string) => {
    const id = addProfile(name);
    setProfileId(id);
  }, []);

  const handleSelect = useCallback((profile) => {
    setProfileId(profile.id);
  }, []);

  return (
    <PageLayout>
      <Heading className="mt-16">Profiles</Heading>

      <div className="-mx-4 flex flex-wrap items-stretch">
        {allProfiles.map((p) => {
          const active = p.id === currentProfileId;

          return (
            <div key={p.id} className="p-4">
              <button
                className={classNames(
                  "pb-4",
                  "flex flex-col items-center",
                  "border",
                  active
                    ? "border-red-500"
                    : "border-white hover:bg-white hover:bg-opacity-5"
                )}
                onClick={active ? undefined : () => handleSelect(p)}
              >
                <AutoIcon
                  seed={p.name}
                  className="w-36 h-36 mb-4"
                  source="boring"
                  variant="bauhaus"
                  square
                />

                <span className="text-xl">
                  <TReplace msg={p.name} />
                </span>
              </button>
            </div>
          );
        })}

        <div className="p-4">
          <button
            className={classNames(
              "h-full w-36 pb-4",
              "flex flex-col items-center justify-center",
              "border border-white",
              "hover:bg-white hover:bg-opacity-5",
              "text-xl"
            )}
            onClick={() => setAdding(true)}
          >
            + Add new
          </button>
        </div>
      </div>

      <AddProfileDialog
        adding={adding}
        onClose={handleCancelAdding}
        onAdd={handleAdd}
      />
    </PageLayout>
  );
};

export default Profiles;

type AddProfileDialogProps = {
  adding: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
};

const AddProfileDialog = memo<AddProfileDialogProps>(
  ({ adding, onClose, onAdd }) => {
    const nameFieldRef = useRef<HTMLInputElement>(null);

    const handleAdd = useCallback(() => {
      if (nameFieldRef.current) {
        onAdd(nameFieldRef.current.value);
      }
    }, [onAdd]);

    return (
      <Transition appear show={adding} as={Fragment}>
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
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur" />
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
                <Dialog.Title
                  as="h3"
                  className="mb-4 text-3xl font-medium leading-6 text-gray-100"
                >
                  Add new profile
                </Dialog.Title>
                <div className="mt-2 mb-12">
                  <p className="text-sm text-gray-300">Lorem ipsum dolor...</p>
                </div>

                <form className="mt-4">
                  <input
                    ref={nameFieldRef}
                    type="text"
                    spellCheck={false}
                    className={classNames(
                      "w-full bg-transparent p-4",
                      "border border-white",
                      "focus:outline-none focus:border-red-500",
                      "text-lg text-white"
                    )}
                  />

                  <div className="mt-8 w-full flex items-stretch">
                    <button
                      type="button"
                      className="inline-flex p-4 text-gray-300 hover:text-gray-100 text-xl"
                      onClick={onClose}
                    >
                      Cancel
                    </button>

                    <div className="flex-1" />

                    <button
                      className="inline-flex p-4 text-gray-300 hover:text-gray-100 text-xl"
                      onClick={handleAdd}
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    );
  }
);
