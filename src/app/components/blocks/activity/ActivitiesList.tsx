import { FC, memo, PropsWithChildren, useCallback, useRef } from "react";
import classNames from "clsx";

import { useLazyAtomValue } from "lib/atom-utils";
import { isPopup } from "lib/ext/view";

import { getPendingActivitiesAtom } from "app/atoms";
import { LOAD_MORE_ON_ACTIVITY_FROM_END } from "app/defaults";
import { useAccounts, useCompleteActivity } from "app/hooks";
import { ReactComponent as NoActivityIcon } from "app/icons/noactivity.svg";

import ActivityAsset from "./ActivityAsset";

const ActivitiesList = memo(() => {
  const { currentAccount } = useAccounts();

  const isPopupMode = isPopup();
  const pendingActivity = useLazyAtomValue(
    getPendingActivitiesAtom(currentAccount.address),
  );
  const {
    activity: completeActivity,
    hasMore,
    loadMore,
  } = useCompleteActivity(currentAccount.address);

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerRef = useCallback(
    (node: HTMLDivElement) => {
      if (!completeActivity) return;

      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [completeActivity, hasMore, loadMore],
  );

  return (
    <>
      {pendingActivity && pendingActivity.length > 0 ? (
        <div className={isPopupMode ? "mb-6" : "mb-8"}>
          <SectionHeader
            isPopupMode={isPopupMode}
            className={isPopupMode ? "mb-4" : "mb-6"}
          >
            Pending
          </SectionHeader>

          {pendingActivity.map((item) => (
            <ActivityAsset
              key={item.id}
              item={item}
              className={isPopupMode ? "mb-3" : "mb-4"}
            />
          ))}
        </div>
      ) : null}

      {completeActivity && completeActivity.length > 0 ? (
        <div className={isPopupMode ? "mb-6" : "mb-8"}>
          {!isPopupMode || (pendingActivity && pendingActivity.length > 0) ? (
            <SectionHeader isPopupMode={isPopupMode} className="mb-6">
              {pendingActivity && pendingActivity.length > 0
                ? "Completed"
                : "Activity"}
            </SectionHeader>
          ) : null}
          {completeActivity.map((item, i) => (
            <ActivityAsset
              key={item.id}
              ref={
                i ===
                completeActivity.length - LOAD_MORE_ON_ACTIVITY_FROM_END - 1
                  ? loadMoreTriggerRef
                  : null
              }
              item={item}
              className={
                isPopupMode
                  ? i !== completeActivity.length - 1
                    ? "mb-3"
                    : ""
                  : "mb-4"
              }
            />
          ))}
        </div>
      ) : null}

      {pendingActivity &&
        completeActivity &&
        pendingActivity.length === 0 &&
        completeActivity.length === 0 && (
          <div
            className={classNames(
              "w-full flex flex-col items-center justify-center",
              isPopupMode ? "min-h-[18rem]" : "min-h-[30rem]",
            )}
          >
            <NoActivityIcon
              className={classNames(
                !isPopupMode ? "w-[4rem]" : "w-[3rem]",
                "h-auto mb-2",
              )}
            />
            <h3
              className={classNames(
                "text-[#4B505C] font-medium",
                !isPopupMode ? "text-xl" : "text-lg",
              )}
            >
              No activity yet
            </h3>
          </div>
        )}
    </>
  );
});

export default ActivitiesList;

const SectionHeader: FC<
  PropsWithChildren<{ isPopupMode: boolean; className?: string }>
> = memo(({ className, children, isPopupMode }) => (
  <div className={classNames("w-full", className)}>
    <h1
      className={classNames("font-bold", isPopupMode ? "text-lg" : "text-2xl")}
    >
      {children}
    </h1>
  </div>
));
