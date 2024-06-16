import { GameObject, type Blueprint, type RegistryEntry } from '@/game-object';
import type { Modifier } from '@/modifier';
import type { Stat } from './stat.go';
import type { Dependency } from '@/dependency';

type WagonName = 'wagon.small' | 'wagon.large';

export class Wagon extends GameObject {
  declare name: WagonName;
  declare seats: number;
  children: { stat: Stat[] } = {
    stat: [],
  };
}
type Key = 'small' | 'large';

export const wagons: Record<Key, Blueprint<Wagon>> = {
  small: {
    name: 'wagon.small',
    seats: 50,
    modifiers: [
      {
        targetName: 'stat.speed',
        keys: ['value'],
        amount: 2,
      } as Modifier<Stat>,
    ],
  },
  large: {
    name: 'wagon.large',
    seats: 200,
    modifiers: [
      {
        targetName: 'stat.speed',
        keys: ['value'],
        amount: -3,
      } as Modifier<Stat>,
    ],
    dependencies: [
      {
        dependencyName: 'stat.power',
        value: 5,
      } as Dependency<Stat>,
    ],
  },
};

declare module '@/game-object' {
  interface Registry {
    wagon: RegistryEntry<Wagon, WagonName>;
  }
}
