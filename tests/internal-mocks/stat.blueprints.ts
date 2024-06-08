import type { Blueprint } from '@/game-object';
import type { Stat } from './stat.go';

type Stats = 'speed' | 'power';

export const stats: Record<Stats, Blueprint<Stat>> = {
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
