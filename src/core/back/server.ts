// import { browser, Runtime } from "webextension-polyfill-ts";
// import { Request } from "core/types";

// const ports = new Set<Runtime.Port>();

// browser.runtime.onConnect.addListener((port) => {
//   if (port.sender?.id === browser.runtime.id) {
//     port.onMessage.addListener(handleMessage);
//     ports.add(port);

//     port.onDisconnect.addListener(() => {
//       port.onMessage.removeListener(handleMessage);
//       ports.delete(port);
//     });
//   }
// });

// function handleMessage(_message: any, _port: Runtime.Port) {}

console.info("KEK");
