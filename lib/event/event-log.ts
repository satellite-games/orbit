/* eslint-disable no-console */
import type { IGameEvent } from './types';

export class EventLog {
  private static _events: IGameEvent[] = [];

  /**
   * Adds an event to the event log.
   */
  static addEvent(event: IGameEvent): void {
    this._events.push(event);
    console.debug(`[game event] ${JSON.stringify(event)}`);
  }

  /**
   * Returns all events in the event log.
   */
  static get events(): IGameEvent[] {
    return this._events;
  }

  /**
   * Clears all events from the event log.
   */
  static clearEvents(): void {
    this._events = [];
  }
}
