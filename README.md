# Orbit

![Release builds](https://github.com/satellite-games/orbit/actions/workflows/release.yml/badge.svg)
![Quality checks](https://github.com/satellite-games/orbit/actions/workflows/main.yml/badge.svg)
![Latest Release](https://img.shields.io/github/v/release/satellite-games/orbit)

<!-- vscode-markdown-toc -->

- [Description](#Description)
- [Primitives](#Primitives)
  - [GameObject](#GameObject)
  - [Blueprint](#Blueprint)
  - [Dependency](#Dependency)
  - [Modifier](#Modifier)
  - [Event](#Event)
- [Building a package with Orbit](#BuildingapackagewithOrbit)
- [License](#License)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='Description'></a>Description

Orbit is a framework for creating digital-first tabletop roleplaying games.

## <a name='Primitives'></a>Primitives

### <a name='GameObject'></a>GameObject

The [`GameObject`](/lib/game-object/game-object.ts) class is Orbit's most important primitive. It represents the base class for all virtual or physical objects in the game world. `GameObject`s have a variety of features: They can reference each other in an owner-children-relationship, depend on each other or modify each other's values.

### <a name='Blueprint'></a>Blueprint

The [`Blueprint`](/lib//game-object/types.ts) type represents a template for `GameObject` instantiation. When you're creating a game using Orbit, you'll be using Blueprints to create most of the game's master data.

### <a name='Dependency'></a>Dependency

The [`Dependency`](/lib/dependency/dependency.ts) class represents a dependency between two `GameObject`s. Dependencies may either represent a requirement or a conflict. A requirement means that one `GameObject` requires another `GameObject` to be present somewhere. A conflict means that one `GameObject` cannot be owned at the same time as another `GameObject`. Dependencies are usually (but not necessarily) checked on a common owner `GameObject`.

### <a name='Modifier'></a>Modifier

The [`Modifier`](/lib/modifier/modifier.ts) class allows `GameObject`s to modify each other's values. When a `GameObject` that comes with a modifier receives a new owner `GameObject`, its modifiers are applied to the owner. This system is used to e.g. apply beneficial or detrimental affects to the owner.

### <a name='Event'></a>Event

The [`Event`](/lib/event/event.ts) class represents the base class for all sorts of events that may happen in the game. Events are stored in a global [`EventLog`](/lib/event/event-log.ts).

## Custom Game Objects

When creating your own game, you will most likely want to create custom `GameObject`s. All you need to do is create a new class that extends `GameObject` and register it:

```ts
import { GameObject } from '@satellite-games/orbit';

export class Item extends GameObject {
  declare name: string;
  declare cost: number;
  // ...
}

// This registers your Game Object with Orbit
declare module '@satellite-games/orbit' {
  interface Registry {
    item: RegistryEntry<Item, string>;
  }
}
```

Registering your `GameObject` enables type-safety while working with your `GameObject`. It is even possible to achieve full type-safety for all of your `Blueprint` names, which will be the possible values of the `GameObject.name` property.

```ts
import { GameObject } from '@satellite-games/orbit';

// Create a literal type with all possible item names
export type ItemName = 'item.potion' | 'item.pouch';

export class Item extends GameObject {
  declare name: ItemName;
  declare cost: number;
  // ...
}

// This registers your GameObject with Orbit
declare module '@satellite-games/orbit' {
  interface Registry {
    item: RegistryEntry<Item, ItemName>;
  }
}

// This will further increase type-safety, e.g. creating and maintaining Blueprints
// All of this is type-safe, even the names!
const itemBlueprints: Blueprint<Item> = [
  {
    name: 'item.pouch',
    cost: 200,
  },
  {
    name: 'item.potion',
    cost: 50,
    dependencies: {
      name: 'item.pouch',
    } as Dependency<Item>,
  },
];
```

While it can be quite tedious to manually maintain a literal type that contains all possible names,
it's easy to write a script that'll generate those literal types for you based on your master data.

## <a name='BuildingapackagewithOrbit'></a>Building a package with Orbit

If you're building a package that is based on Orbit, you might want consumers to be able to access Orbit's features or types without having to install it separately. To achieve that, simply re-export everything from Orbit in your package. For example, in your main entrypoint file, do:

```js
export * from '@satellite-games/orbit';
```

## <a name='License'></a>License

See [LICENSE](/LICENSE).
