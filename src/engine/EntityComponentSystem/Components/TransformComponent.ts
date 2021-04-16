import { vec, Vector } from '../../Algebra';
import { Component } from '../Component';

export interface Transform {
   /**
   * The [[coordinate plane|CoordPlane]] for this transform for the entity.
   */
  coordPlane: CoordPlane;

  /**
   * The current position of the entity in world space or in screen space depending on the the [[coordinate plan|CoordPlane]]
   */
  pos: Vector;

  /**
   * The z-index ordering of the entity, a higher values are drawn on top of lower values.
   * For example z=99 would be drawn on top of z=0.
   */
  z: number;

  /**
   * The rotation of the entity in radians. For example `Math.PI` radians is the same as 180 degrees.
   */
  rotation: number;

  /**
   * The scale of the entity.
   */
  scale: Vector;
}

/**
 * Enum representing the coordinate plane for the position 2D vector in the [[TransformComponent]]
 */
export enum CoordPlane {
  /**
   * The world coordinate plane (default) represents world space, any entities drawn with world
   * space move when the camera moves.
   */
  World = 'world',
  /**
   * The screen coordinate plane represents screen space, entities drawn in screen space are pinned
   * to screen coordinates ignoring the camera.
   */
  Screen = 'screen'
}

export class TransformComponent extends Component<'transform'> implements Transform {
  public readonly type = 'transform';

  /**
   * The [[coordinate plane|CoordPlane]] for this transform for the entity.
   */
  public coordPlane = CoordPlane.World;

  /**
   * The current position of the entity in world space or in screen space depending on the the [[coordinate plan|CoordPlane]]
   */
  public pos: Vector = Vector.Zero;

  /**
   * The z-index ordering of the entity, a higher values are drawn on top of lower values.
   * For example z=99 would be drawn on top of z=0.
   */
  public z: number = 0;

  /**
   * The rotation of the entity in radians. For example `Math.PI` radians is the same as 180 degrees.
   */
  public rotation: number = 0;

  /**
   * The scale of the entity.
   */
  public scale: Vector = Vector.One;

  /**
   * Apply the transform to a point
   * @param point 
   */
  public apply(point: Vector): Vector {
    return point.scale(this.scale).rotate(this.rotation).add(this.pos)
  }

  /**
   * Apply the inverse transform to a point
   * @param point 
   */
  public applyInverse(point: Vector): Vector {
    // TODO use matrix inverse after merging main
    return point.sub(this.pos).rotate(-this.rotation).scale(vec(1/this.scale.x, 1/this.scale.y));
  }
}
