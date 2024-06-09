import { GameObject, type Blueprint, type RegistryEntry } from '@/game-object';
import { Stat } from './stat.go';
import { Wagon } from './wagon.go';

type TrainName = 'train.thomas' | 'train.polar-express' | 'train.orient-express';

export class Train extends GameObject {
  declare name: TrainName;
  declare noise: string;
  children: { stat: Stat[]; wagon: Wagon[] } = {
    stat: [],
    wagon: [],
  };

  makeNoise() {
    return this.noise;
  }

  get length() {
    return this.children.wagon.length + 1;
  }
}

type Key = 'thomas' | 'polarExpress' | 'orientExpress';

export const trains: Record<Key, Blueprint<Train, 'length'>> = {
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

declare module '@/game-object' {
  interface Registry {
    train: RegistryEntry<Train, TrainName>;
  }
}
