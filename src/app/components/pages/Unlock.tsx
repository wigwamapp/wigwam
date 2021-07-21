import {
  FC,
  useMemo,
  memo,
  useRef,
  useCallback,
  FormEventHandler,
} from "react";
import classNames from "clsx";
import ArrowCircleRightIcon from "@heroicons/react/solid/ArrowCircleRightIcon";

import { isPopup } from "lib/ext/view";

import { unlockWallet } from "core/client";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import TextField from "app/components/elements/TextField";
import { openInTab } from "app/helpers";

const Unlock: FC = () => {
  const popup = useMemo(() => isPopup(), []);

  return (
    <>
      {popup ? (
        <div
          className={classNames(
            "min-h-screen w-full",
            "flex flex-col items-center justify-center",
            "p-8"
          )}
        >
          <button
            className="mb-8 text-lg text-white"
            onClick={() => openInTab()}
          >
            Open in Tab
          </button>
          <UnlockForm />
        </div>
      ) : (
        <BoardingPageLayout>
          <UnlockForm />
        </BoardingPageLayout>
      )}
    </>
  );
};

export default Unlock;

const UnlockForm = memo(() => {
  const passwordFieldRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (evt) => {
      evt.preventDefault();

      const password = passwordFieldRef.current?.value;
      if (password) {
        try {
          await unlockWallet(password);
        } catch (err) {
          alert(err.message);
        }
      }
    },
    []
  );

  return (
    <form className="w-full flex flex-col items-center" onSubmit={handleSubmit}>
      <TextField
        ref={passwordFieldRef}
        type="password"
        placeholder="******"
        className="mb-8 w-full max-w-sm"
      />

      <button
        className={classNames(
          "inline-flex items-center",
          "text-3xl",
          "text-gray-100",
          "transition ease-in-out duration-300",
          "animate-pulse hover:animate-none focus:animate-none"
        )}
      >
        Unlock
        <ArrowCircleRightIcon className="h-8 w-auto ml-4" />
      </button>
    </form>
  );
});
