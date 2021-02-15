import { Engine } from '../Engine';
import { Actor } from '../Actor';
import { Entity, System, SystemType } from '../EntityComponentSystem';
import { CanvasDrawComponent } from './CanvasDrawComponent';
import { Scene } from '../Scene';
import { Camera } from '../Camera';
import { CoordPlane, TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { GraphicsDiagnostics } from '../Graphics/GraphicsDiagnostics';

/**
 * Draws anything with a transform and a "draw" method
 */
export class CanvasDrawingSystem extends System<TransformComponent | CanvasDrawComponent> {
  public readonly types = ['transform', 'canvas'] as const;
  public systemType = SystemType.Draw;
  public priority = -1;

  private _ctx: CanvasRenderingContext2D;
  private _camera: Camera;
  private _engine: Engine;

  public initialize(scene: Scene): void {
    this._ctx = scene.engine.ctx;
    this._engine = scene.engine;
    this._camera = scene.camera;
  }

  public sort(a: Entity<TransformComponent | CanvasDrawComponent>, b: Entity<TransformComponent | CanvasDrawComponent>) {
    return a.components.transform.z - b.components.transform.z;
  }

  public update(entities: Entity<TransformComponent | CanvasDrawComponent>[], delta: number) {
    this._clearScreen();

    let transform: TransformComponent;
    let canvasdraw: CanvasDrawComponent;
    const length = entities.length;
    for (let i = 0; i < length; i++) {
      if ((entities[i] as Actor).visible && !(entities[i] as Actor).isOffScreen) {
        transform = entities[i].components.transform;
        canvasdraw = entities[i].components.canvas;

        this._ctx.save();
        this._pushCameraTransform(transform);

        this._ctx.save();
        this._applyTransform(entities[i]);
        canvasdraw.draw(this._ctx, delta);
        this._ctx.restore();

        this._popCameraTransform(transform);
        this._ctx.restore();
      }

      if (this._engine.isDebug) {
        this._ctx.save();
        this._pushCameraTransform(transform);
        this._ctx.strokeStyle = 'yellow';
        (entities[i] as Actor).debugDraw(this._ctx);
        this._popCameraTransform(transform);
        this._ctx.restore();
      }
    }
    if (this._engine.isDebug) {
      this._ctx.save();
      this._camera.draw(this._ctx);
      this._camera.debugDraw(this._ctx);
      this._ctx.restore();
    }

    this._engine.stats.currFrame.graphics.drawnImages = GraphicsDiagnostics.DrawnImagesCount;
    this._engine.stats.currFrame.graphics.drawCalls = GraphicsDiagnostics.DrawCallCount;
  }

  private _applyTransform(entity: Entity<TransformComponent>) {
    const ancestors = entity.getAncestors();
    for (let ancestor of ancestors) {
      let transform = ancestor?.get(TransformComponent);
      if (transform) {
        this._ctx.translate(transform.pos.x, transform.pos.y);
        this._ctx.rotate(transform.rotation);
        this._ctx.scale(transform.scale.x, transform.scale.y);
      }
    }
  }

  private _clearScreen(): void {
    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    this._ctx.fillStyle = this._engine.backgroundColor.toString();
    this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
  }

  private _pushCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Apply camera transform to place entity in world space
      this._ctx.save();
      if (this._camera) {
        this._camera.draw(this._ctx);
      }
    }
  }

  private _popCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Restore back to screen space from world space if we were drawing an entity there
      this._ctx.restore();
    }
  }
}
