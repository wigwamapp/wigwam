import consola from "consola";

consola
  .create({ level: process.env.NODE_ENV === "development" ? 5 : 1 })
  .wrapConsole();
