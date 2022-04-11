import { getRandomInt } from "lib/system/randomInt";

import { ADJECTIVES } from "./adjectives";
import { NOUNS } from "./nouns";

export function getRandomName() {
  const adjective = pickRandom(ADJECTIVES);
  const noun = pickRandom(NOUNS);

  return [adjective, noun].map(capitalizeFirstLetter).join(" ");
}

function pickRandom(words: string[]) {
  return words[getRandomInt(0, words.length)];
}

function capitalizeFirstLetter(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}
