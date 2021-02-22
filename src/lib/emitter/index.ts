/**
 * Inspired by https://github.com/developit/mitt
 */

export type EventType = string | symbol;

// An event handler can take an optional event argument
// and should not return a value
export type Handler<T = any> = (event?: T) => void;
export type WildcardHandler = (type: EventType, event?: any) => void;

// An array of all currently registered event handlers for a type
export type EventHandlerList = Array<Handler>;
export type WildCardEventHandlerList = Array<WildcardHandler>;

// A map of event types and their corresponding event handlers.
export type EventHandlerMap = Map<
  EventType,
  EventHandlerList | WildCardEventHandlerList
>;

export class Emitter {
  private all: EventHandlerMap = new Map();

  /**
   * Register an event handler for the given type.
   * @param {string|symbol} type Type of event to listen for
   * @param {Function} handler Function to call in response to given event
   * @memberOf Emitter
   */
  on<T = any>(type: EventType, handler: Handler<T>) {
    const handlers = this.all.get(type);
    const added = handlers && handlers.push(handler);
    if (!added) {
      this.all.set(type, [handler]);
    }
  }

  /**
   * Remove an event handler for the given type.
   * @param {string|symbol} type Type of event to unregister `handler` from
   * @param {Function} handler Handler function to remove
   * @memberOf Emitter
   */
  removeListener<T = any>(type: EventType, handler: Handler<T>) {
    const handlers = this.all.get(type);
    if (handlers) {
      handlers.splice(handlers.indexOf(handler) >>> 0, 1);
    }
  }

  /**
   * Invoke all handlers for the given type.
   *
   * @param {string|symbol} type The event type to invoke
   * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
   * @memberOf Emitter
   */
  emit<T = any>(type: EventType, evt: T) {
    ((this.all.get(type) || []) as EventHandlerList).slice().map((handler) => {
      try {
        handler(evt);
      } catch {}
    });
  }
}
