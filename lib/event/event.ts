import { EventLog } from './event-log';
import { type GameEventInit, GameEventType, type IGameEvent } from './types';

/**
 * A game event. This is the base class for all game events.
 */
export abstract class GameEvent implements IGameEvent {
  abstract type: GameEventType;
  message: string;
  timestamp: string;
  constructor(init: GameEventInit<GameEvent>) {
    this.message = init.message;
    this.timestamp = new Date().toISOString();
    // Assign the rest of the properties that might be present on the child class.
    Object.assign(this, init);
    EventLog.addEvent(this);
  }
}
