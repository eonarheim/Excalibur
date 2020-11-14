import { isActor } from '../Actor';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { GraphicsComponent } from './GraphicsComponent';
import { Vector } from '../Algebra';
import { Color } from '../Drawing/Color';
import { CoordPlane, TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { Camera } from '../Camera';

export class GraphicsSystem {
  public readonly types = [GraphicsComponent.type, TransformComponent.type];
  private _token = 0;
  private _graphicsContext: ExcaliburGraphicsContext;
  private _scene: Scene;
  private _camera: Camera;

  public initialize(scene: Scene): void {
    this._graphicsContext = scene.engine.graphicsContext;
    this._camera = scene.camera;
  }

  public sort(a: Entity<TransformComponent | GraphicsComponent>, b: Entity<TransformComponent | GraphicsComponent>) {
    return a.components.transform.z - b.components.transform.z;
  }

  public update(entities: Entity<GraphicsComponent | TransformComponent>[], delta: number): void {
    this._clearScreen();
    this._token++;
    let transform: TransformComponent;
    let graphics: GraphicsComponent;
    for (const entity of entities) {
      transform = entity.components.transform;
      graphics = entity.components.graphics;

      // Skip entities that have graphics offscreen
      if (this._isOffscreen(transform, graphics)) {
        continue;
      }

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      this._pushCameraTransform(transform);

      this._graphicsContext.save();

      // Optionally run the onPreDraw graphics lifecycle draw
      if (graphics.onPreDraw) {
        graphics.onPreDraw(this._graphicsContext);
      }

      // Tick any graphics state (but only once) for animations and graphics groups
      graphics.update(delta, this._token);

      // Position the entity
      this._applyTransform(transform);

      this._graphicsPositionDebugDraw();

      // TODO should this be in apply transform???
      this._graphicsContext.z = transform.z;
      this._graphicsContext.opacity = graphics.opacity * ((entity as any).opacity ?? 1);

      // Draw the graphics component
      graphics.draw(this._graphicsContext, 0, 0);

      // Optionally run the onPostDraw graphics lifecycle draw
      if (graphics.onPostDraw) {
        graphics.onPostDraw(this._graphicsContext);
      }

      this._graphicsContext.restore();

      // Draw the graphics bounds
      this._graphicsBoundsDebugDraw(entity, transform, graphics);

      // Reset the transform back to the original
      this._popCameraTransform(transform);
    }

    // this.scene.legacyLifecycleDraw(this._graphicsContext);
    this._graphicsContext.flush();
  }

  private _clearScreen(): void {
    this._graphicsContext.clear();
  }

  private _isOffscreen(transform: TransformComponent, graphics: GraphicsComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      const graphicsOffscreen = !this._camera.viewport.intersect(graphics.localBounds.translate(transform.pos));
      return graphicsOffscreen;
    } else {
      // TODO sceen coordinates
      return false;
    }
  }

  /**
   * This applies the current entity transform to the graphics context
   * @param transform
   */
  private _applyTransform(transform: TransformComponent): void {
    this._graphicsContext.translate(transform.pos.x, transform.pos.y);
    this._graphicsContext.rotate(transform.rotation);
    this._graphicsContext.scale(transform.scale.x, transform.scale.y);
  }

  /**
   * Applies the current camera transform if in world coordinates
   * @param transform
   */
  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform.coordPlane === CoordPlane.World) {
      this._graphicsContext.save();
      if (this?._scene?.camera) {
        this._scene.camera.draw(this._graphicsContext);
      }
    }
  }

  /**
   * Resets the current camera transform if in world coordinates
   * @param transform
   */
  private _popCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Apply camera world offset
      this._graphicsContext.restore();
    }
  }

  private _graphicsPositionDebugDraw() {
    if ((this._scene as any)._engine.isDebug) {
      this._graphicsContext.drawPoint(Vector.Zero, { color: Color.Yellow, size: 5 });
    }
  }

  private _graphicsBoundsDebugDraw(
    entity: Entity<GraphicsComponent | TransformComponent>,
    transform: TransformComponent,
    graphics: GraphicsComponent
  ) {
    if ((this._scene as any)._engine.isDebug) {
      if (isActor(entity)) {
        const bb = entity.body.collider.localBounds.translate(entity.getWorldPos());
        bb.draw(this._graphicsContext);
      }

      this._graphicsContext.save();
      this._applyTransform(transform);
      graphics.debugDraw(this._graphicsContext, 0, 0);
      this._graphicsContext.restore();
    }
  }
}
