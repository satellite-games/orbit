import { GameObject } from '@/game-object';
import { Stat } from './stat.go';
import { Wagon } from './wagon.go';

export class Train extends GameObject {
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
