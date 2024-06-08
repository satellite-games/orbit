import type { Blueprint } from '@/game-object';
import type { Train } from './train.go';

type Trains = 'thomas' | 'polarExpress' | 'orientExpress';

export const trains: Record<Trains, Blueprint<Train, 'length'>> = {
  thomas: {
    name: 'train.thomas',
    noise: 'toot toot',
  },
  polarExpress: {
    name: 'train.polar-express',
    noise: 'bells',
  },
  orientExpress: {
    name: 'train.orient-express',
    noise: 'chug chug',
  },
};
