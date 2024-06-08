/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';
import type { Blueprint, GameObjectName, GameObjectRegistry, GameObjectTypeName, Saved } from './types';
import type { ElementType, NumericProperty } from '@/types/private-types';
import { Modifier, applyModifiers } from '@/modifier';
import { Dependency } from '@/dependency/dependency';
import { getGameObjectTypeName } from './game-object.utils';

/**
 * A game object is an entity in the game world. It is a container for data and functions.
 * Game objects usually derive from a blueprint, which defines the schema of the game object.
 */
export class GameObject implements GameObject {
  /**
   * The name of the game object's blueprint. This name is a unique key that identifies
   * the blueprint in the game database.
   */
  name: string;
  /**
   * The unique identifier of the game object.
   */
  id: string;
  /**
   * What game object owns this game object. May be null.
   */
  protected owner?: GameObject | null;
  /**
   * Any modifiers that are currently affecting the game object.
   */
  modifiers?: Modifier<any>[];
  /**
   * Any dependencies that the game object has.
   */
  dependencies?: Dependency<any>[];
  /**
   * Any child game objects that are stored on this game object.
   */
  children: Partial<Record<GameObjectTypeName, Array<GameObjectRegistry[GameObjectTypeName]>>>;

  constructor(init: {
    name: GameObjectName;
    id?: string;
    owner?: GameObject | null;
    modifiers?: Modifier<any>[];
    dependencies?: Dependency<any>[];
    children?: Partial<Record<GameObjectTypeName, Array<GameObjectRegistry[GameObjectTypeName]>>>;
    [key: string]: any;
  }) {
    // Perform a shallow copy of the initialization object. This also covers
    // for any child classes that may have additional properties.
    Object.assign(this, init);
    // Assign the core GameObject properties specifically.
    this.name = init.name;
    this.id = init.id ?? uuidv4();
    this.owner = init.owner ?? null;
    this.modifiers = init.modifiers?.map((modifier) => new Modifier(modifier));
    this.dependencies = init.dependencies?.map((dependency) => new Dependency(dependency));
    this.children = init.children ?? {};
  }

  /**
   * Returns the owner of the game object or null if it has no owner.
   */
  getOwner<TGameObject extends GameObject>(): TGameObject | null {
    return this.owner as TGameObject | null;
  }

  /**
   * Returns a specific type of children of the game object by the given name.
   * @param name The name of the children to return.
   */
  getChildren<
    TGameObject extends GameObject,
    TChildren extends ElementType<TGameObject['children'][keyof TGameObject['children']]>,
    TKey = keyof TGameObject['children'],
  >(name: TKey): TChildren[] {
    return (this.children[name] as TChildren[]) ?? [];
  }

  /**
   * Sets a specific type of children on the game object.
   * @param children The children to set on the game object.
   */
  setChildren<
    TGameObject extends GameObject,
    TChildren extends ElementType<TGameObject['children'][keyof TGameObject['children']]>,
  >(children: TChildren[]) {
    const collectionName = getGameObjectTypeName((children[0] as GameObject).name);
    const oldChildren = this.children[collectionName as GameObjectTypeName];
    if (!oldChildren) {
      throw new Error(
        `Collection name '${collectionName}' is not a valid child collection for game object '${this.name}'.`,
      );
    }
    if (!children || children.length === 0) {
      throw new Error('Cannot set an empty array of children on a game object.');
    }
    for (const child of children) (child as GameObject).owner = this;
    this.children[collectionName] = children as unknown as typeof oldChildren;
  }

  /**
   * Adds a child to the game object.
   * @param child The child to add to the game object.
   */
  addChild<
    TGameObject extends GameObject,
    TChild extends ElementType<TGameObject['children'][keyof TGameObject['children']]>,
  >(child: TChild) {
    const collectionName = getGameObjectTypeName((child as GameObject).name);
    const children = this.getChildren<TGameObject, TChild>(collectionName);
    children.push(child);
    (child as GameObject).owner = this;
    return children;
  }

  /**
   * Removes a child from the game object.
   * @param child The child to remove from the game object.
   */
  removeChild<
    TGameObject extends GameObject,
    TChild extends ElementType<TGameObject['children'][keyof TGameObject['children']]>,
  >(child: TChild) {
    const collectionName = getGameObjectTypeName((child as GameObject).name);
    const children = this.getChildren<TGameObject, TChild>(collectionName);
    const index = children.indexOf(child);
    if (index === -1) {
      throw new Error(`Child with ID '${(child as GameObject).id}' not found in collection '${collectionName}'.`);
    }
    children.splice(index, 1);
    (child as GameObject).owner = null;
    return children;
  }

  /**
   * Finds a child by its name. This method searches all children of the game object.
   * Returns `undefined` if the child is not found. If multiple children have the same name,
   * the first child found is returned.
   * @param name
   */
  findChildByName<TGameObject extends GameObject>(name: string): TGameObject | undefined {
    for (const collection of Object.values(this.children)) {
      const child = collection?.find((child) => (child as GameObject).name === name);
      if (child) return child as TGameObject;
    }
    return undefined;
  }

  /**
   * Finds a child by its unique identifier. This method searches all children of the game object.
   * Returns `undefined` if the child is not found.
   * @param id The unique identifier of the child to find.
   */
  findChildById<TGameObject extends GameObject>(id: string): TGameObject | undefined {
    for (const collection of Object.values(this.children)) {
      const child = collection?.find((child) => (child as GameObject).id === id);
      if (child) return child as TGameObject;
    }
    return undefined;
  }

  /**
   * Recursively checks all children for modifiers affecting this game object and returns them.
   * @param filter An optional filter to only return modifiers that match the filter.
   */
  getModifiersRecursively<TGameObject extends GameObject>(filter?: {
    targetName?: GameObjectName;
    targetId?: string;
  }): Modifier<TGameObject>[] {
    // Start with the modifiers of this game object
    let modifiers: Modifier<TGameObject>[] = [...(this.modifiers ?? [])];

    // Recursively get all modifiers from this game object's children
    for (const childArray of Object.values(this.children)) {
      if (!childArray) continue;
      for (const child of childArray) {
        modifiers = modifiers.concat(child.getModifiersRecursively());
      }
    }

    // Apply filter if provided
    if (filter) {
      if (filter.targetName) {
        modifiers = modifiers.filter((modifier) => modifier.targetName === filter.targetName);
      }
      if (filter.targetId) {
        modifiers = modifiers.filter((modifier) => (modifier.targetId ? modifier.targetId === filter.targetId : true));
      }
    }

    return modifiers;
  }

  /**
   * Returns the modified value of the specified key by applying all matching modifiers.
   * @param key The key of the value to get the modified value for.
   * @param modifierOwner The game object that owns the modifiers to apply. Defaults to
   * this game object's owner if it exists, otherwise this game object.
   * @returns The modified value.
   */
  getModifiedValue<TGameObject extends GameObject>(key: NumericProperty<TGameObject>, modifierOwner?: GameObject) {
    if (!modifierOwner) modifierOwner = this.owner ?? this;
    const modifiers = modifierOwner.getModifiersRecursively<TGameObject>({
      targetName: this.name,
      targetId: this.id,
    });
    return applyModifiers<TGameObject>(
      this as unknown as TGameObject,
      key,
      modifiers ?? (this.modifiers as Modifier<TGameObject>[]),
    );
  }

  /**
   * Checks whether the given game object (e.g. the owner) meets all dependencies of this
   * game object or causes any conflicts.
   * @param gameObject The game object to check the dependencies against.
   * @returns `true` if all dependencies are met and no conflicts are present or a list of
   * all dependencies that failed the check.
   */
  checkDependencies<TTarget extends GameObject>(gameObject: TTarget): true | Dependency<unknown>[] {
    let result: true | Dependency<unknown>[] = true;
    if (this.dependencies) {
      for (const dependency of this.dependencies) {
        if (!dependency.check(gameObject)) {
          if (result === true) result = [];
          result.push(dependency);
          break;
        }
      }
    }
    return result;
  }

  /**
   * A hook that runs before the game object is serialized. This can be used by subclasses
   * to customize the serialization process.
   * @param object The object to serialize.
   */
  beforeSerialize(object: typeof this): object {
    // Do nothing by default
    return object;
  }

  /**
   * Serializes the game object. This is useful for saving the game state to a file.
   * @param state The state of the game object to serialize. Defaults to the current state
   * (`this`) of the game object. A different state may be provided to apply changes to the
   * game object before serialization.
   */
  serialize(state?: typeof this): string {
    const object: typeof this = state ? { ...state } : { ...this };
    const preSerializedObject: Record<string, any> = this.beforeSerialize(object);
    // Remove owner reference
    delete preSerializedObject.owner;
    if (Object.keys(object.children).length === 0) {
      // Remove empty children objects
      delete preSerializedObject.children;
    } else {
      // Or serialize children
      for (const key in object.children) {
        const children = object.children[key as any as keyof typeof object.children];
        if (!children) continue;
        preSerializedObject.children[key] = children.map((child) => child.serialize());
      }
    }
    return JSON.stringify(preSerializedObject);
  }
}