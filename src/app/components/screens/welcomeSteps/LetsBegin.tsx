import { FC, useCallback, useEffect, useRef, useState } from "react";
import classNames from "clsx";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import { DEFAULT_NETWORKS, NETWORK_ICON_MAP } from "fixtures/networks";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import NewButton from "app/components/elements/NewButton";

const letterTypingDuration = 180;
const beforeDeleteDelay = 1000;
const beforeTypeDelay = 300;

const getClassName = (index: number) => {
  switch (index) {
    case 0:
      return "ether";
      break;
    case 1:
      return "avalanche";
      break;
    case 2:
      return "bnb";
      break;
    case 3:
      return "polygon";
      break;
    case 4:
      return "fantom";
      break;
    case 5:
      return "optimism";
      break;
    case 6:
      return "arbitrum";
      break;
    case 7:
      return "aurora";
      break;
    case 8:
      return "harmony";
      break;
    case 9:
      return "huobi";
      break;
    case 10:
      return "celo";
      break;
    default:
      return "ether";
  }
};

const LetsBegin: FC = () => {
  const transitionRef = useRef<HTMLImageElement>(null);

  const ntwrks = DEFAULT_NETWORKS.filter(({ type }) => type === "mainnet");

  const [networkNumber, setNetworkNumber] = useState(0);
  const [printedLine, setPrintedLine] = useState(ntwrks[0].name);

  const writeAnimation = useCallback(
    (wordNumber = 0, letterNumber = 0, isDeleting = true) => {
      const word = ntwrks[wordNumber].name;
      if (isDeleting) {
        if (letterNumber !== word.length + 1) {
          setTimeout(() => {
            setPrintedLine(word.substring(0, word.length - letterNumber));
            writeAnimation(wordNumber, letterNumber + 1);
          }, letterTypingDuration);
        } else {
          setTimeout(() => {
            const newWordNumber =
              wordNumber + 1 === ntwrks.length ? 0 : wordNumber + 1;
            setNetworkNumber(newWordNumber);
            writeAnimation(newWordNumber, 0, false);
          }, beforeTypeDelay);
        }
      } else {
        if (letterNumber !== word.length + 1) {
          setTimeout(() => {
            setPrintedLine(word.substring(0, letterNumber));
            writeAnimation(wordNumber, letterNumber + 1, false);
          }, letterTypingDuration);
        } else {
          setTimeout(() => {
            writeAnimation(wordNumber, 0);
          }, beforeDeleteDelay);
        }
      }
    },
    []
  );

  useEffect(() => {
    writeAnimation(0);
  }, []);

  console.log("getClassName(networkNumber)", getClassName(networkNumber));

  return (
    <BoardingPageLayout header={false} isWelcome>
      <div className="flex flex-col items-center">
        <h1 className="mb-6 text-5xl font-bold">Vigvam wallet for</h1>
        <div
          className={classNames(
            "flex items-center text-5xl font-bold relative h-12",
            getClassName(networkNumber)
          )}
          style={{ perspective: 1000 }}
        >
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={networkNumber}
              nodeRef={transitionRef}
              timeout={150}
              classNames="card-flip-horizontal"
            >
              <img
                ref={transitionRef}
                style={{ transformStyle: "preserve-3d" }}
                className="transform-gpu transition mr-4"
                src={NETWORK_ICON_MAP.get(ntwrks[networkNumber].chainId)}
                alt=""
              />
            </CSSTransition>
          </SwitchTransition>
          <span>{printedLine}</span>
          <span className="caret" />
        </div>

        <NewButton
          to={{ addAccOpened: true }}
          merge
          className="w-[14rem] mt-24"
        >
          Add Wallet
        </NewButton>
      </div>
    </BoardingPageLayout>
  );
};

export default LetsBegin;
