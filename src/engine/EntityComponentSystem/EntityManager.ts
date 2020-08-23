import { Entity, RemovedComponent, AddedComponent, isAddedComponent, isRemovedComponent } from './Entity';
import { Observer } from '../Util/Observable';
import { Util } from '..';
import { Scene } from '../Scene';

// Add/Remove entitys and components

export class EntityManager implements Observer<RemovedComponent | AddedComponent> {
  public entities: Entity[] = [];
  public _entityIndex: { [entityId: string]: Entity } = {};

  constructor(private _scene: Scene) {}

  /**
   * EntityManager observes changes on entities
   * @param message
   */
  public notify(message: RemovedComponent | AddedComponent): void {
    if (isAddedComponent(message)) {
      // we don't need the component, it's already on the entity
      this._scene.queryManager.addEntity(message.data.entity);
    }

    if (isRemovedComponent(message)) {
      this._scene.queryManager.removeComponent(message.data.entity, message.data.component);
    }
  }

  /**
   * Adds an entity to be tracked by the EntityManager
   * @param entity
   */
  public addEntity(entity: Entity): void {
    if (entity) {
      this._entityIndex[entity.id] = entity;
      this.entities.push(entity);
      this._scene.queryManager.addEntity(entity);
      entity.changes.register(this);
    }
  }

  public removeEntity(entity: Entity): void;
  public removeEntity(id: number): void;
  public removeEntity(idOrEntity: number | Entity): void {
    let id = 0;
    if (idOrEntity instanceof Entity) {
      id = idOrEntity.id;
    } else {
      id = idOrEntity;
    }
    const entity = this._entityIndex[id];
    delete this._entityIndex[id];
    if (entity) {
      Util.removeItemFromArray(entity, this.entities);
      this._scene.queryManager.removeEntity(entity);
      entity.changes.unregister(this);
    }
  }

  public processRemovals(): void {
    for (const entity of this.entities) {
      entity.processRemoval();
    }
  }

  public getById(id: number): Entity {
    return this._entityIndex[id];
  }
}
