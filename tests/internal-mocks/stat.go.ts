import { GameObject, type Blueprint, type RegistryEntry } from '@/game-object';

type StatName = 'stat.speed' | 'stat.power';

export class Stat extends GameObject {
  declare name: StatName;
  declare value: number;
  declare max: number;
}

type Key = 'speed' | 'power';

export const stats: Record<Key, Blueprint<Stat>> = {
  speed: {
    name: 'stat.speed',
    value: 5,
    max: 10,
  },
  power: {
    name: 'stat.power',
    value: 10,
    max: 10,
  },
};

declare module '@/game-object' {
  interface Registry {
    stat: RegistryEntry<Stat, StatName>;
  }
}
