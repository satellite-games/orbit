import { type NonFunctionPropertyNames } from '@/types/private-types';

export interface IGameEvent {
  /**
   * The type of event.
   */
  type: GameEventType;
  /**
   * The message of the event.
   */
  message: string;
  /**
   * The timestamp of the event. This is an ISO 8601 string.
   */
  timestamp: string;
}

export const GameEventType = {
  /**
   * An event related to a specific character.
   */
  character: 'character',
} as const;
export type GameEventType = (typeof GameEventType)[keyof typeof GameEventType];

export type GameEventInit<TEvent extends IGameEvent> = Omit<
  Pick<TEvent, NonFunctionPropertyNames<TEvent>>,
  'timestamp' | 'type'
>;
