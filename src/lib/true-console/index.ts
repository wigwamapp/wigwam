import consola from "consola";

export function enableTrueConsole() {
  consola
    .create({
      level: process.env.NODE_ENV === "development" ? 5 : 1,
    })
    .wrapConsole();
}
