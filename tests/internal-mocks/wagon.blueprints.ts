import type { Blueprint } from '@/game-object';
import type { Wagon } from './wagon.go';
import type { Modifier } from '@/modifier';
import type { Stat } from './stat.go';
import type { Dependency } from '@/dependency';

export const wagons: Record<'small' | 'large', Blueprint<Wagon>> = {
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
        name: 'stat.power',
        value: 5,
      } as Dependency<Stat>,
    ],
  },
};
