import SafeEventEmitter from "@metamask/safe-event-emitter";

// Increase max listeners from 10 to 150
// Allow to use `Symbol` as event type, not only `String`
export class Emitter extends SafeEventEmitter {
  constructor() {
    super();
    this.setMaxListeners(150);
  }

  emit(type: string | symbol, ...args: any[]): boolean {
    return super.emit(type as any, ...args);
  }
}
