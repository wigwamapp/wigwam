// import type { InpageProvider } from "./provider";
// import type { FilterManager } from "./filterManager";

// type Subscription = {};

// export class SubscriptionManager {
//   private subscriptions = new Map<string, Subscription>();

//   constructor(private provider: InpageProvider, private filter: FilterManager) {
//     // this.provider.emit("message",)
//   }

//   async subscribe(params: any[]) {
//     const subscriptionType = params[0];
//     const subId = unsafeRandomBytes(16);

//     // let sub;

//     switch (subscriptionType) {
//       case "newHeads":
//         // sub = createSubNewHeads({ subId });
//         return subId;
//         break;

//       case "logs":
//         const { address, topics } = params[1];
//         const filter = await this.filter.newFilter({ address, topics });
//         // sub = createSubFromFilter({ subId, filter });
//         break;

//       default:
//         throw new Error(
//           `SubscriptionManager - unsupported subscription type "${subscriptionType}"`
//         );
//     }
//   }

//   unsubscribe() {}
// }

// function unsafeRandomBytes(byteCount: number) {
//   let result = "0x";
//   for (let i = 0; i < byteCount; i++) {
//     result += unsafeRandomNibble();
//     result += unsafeRandomNibble();
//   }
//   return result;
// }

// function unsafeRandomNibble() {
//   return Math.floor(Math.random() * 16).toString(16);
// }

export {};
