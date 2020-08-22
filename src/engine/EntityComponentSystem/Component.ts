import { Entity } from './Entity';

export interface ComponentCtor {
  new (): Component;
}

function hasClone(x: any): x is { clone(): any } {
  return !!x.clone;
}

/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity posesses
 *
 * Implementations of Component must have a zero-arg constructor
 */
export abstract class Component<TypeName extends string = string> {
  /**
   * Optionally list any component types this component depends on
   * If the owner entity does not have these components, new components will be added to the entity
   *
   * Only components with zero-arg constructors are supported as automatic component dependencies
   */
  readonly dependencies?: ComponentCtor[];

  /**
   * Type of this component, must be a unique type among component types in you game.
   * See [[BuiltinComponentTypes]] for a list of built in excalibur types
   */
  readonly type: TypeName;

  /**
   * Current owning [[Entity]], if any, of this component. Null if not added to any [[Entity]]
   */
  owner?: Entity;
  clone(): this {
    const newComponent = new (this.constructor as any)();
    for (const prop in this) {
      const val = this[prop];
      if (hasClone(val)) {
        newComponent[prop] = val.clone();
      } else {
        newComponent[prop] = val;
      }
    }
    return newComponent;
  }

  /**
   * Optional callback called when a component is added to an entity
   */
  onAdd?: (owner: Entity) => void;

  /**
   * Opitonal callback called when acomponent is added to an entity
   */
  onRemove?: (previousOwner: Entity) => void;
}
