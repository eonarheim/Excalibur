import { Physics } from './../Physics';
import { Trait } from '../Interfaces/Trait';
import { Actor, CollisionType } from '../Actor';
import { Engine } from '../Engine';

export class EulerMovement implements Trait {
  public update(actor: Actor, _engine: Engine, delta: number) {
    // Update placements based on linear algebra
    const seconds = delta / 1000;

    const totalAcc = actor.acc.clone();
    // Only active vanilla actors are affected by global acceleration
    if (actor.collisionType === CollisionType.Active) {
      totalAcc.addEqual(Physics.acc);
    }

    actor.oldVel = actor.vel;
    actor.vel.addEqual(totalAcc.scale(seconds));

    actor.pos.addEqual(actor.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

    actor.rx += actor.torque * (1.0 / actor.moi) * seconds;
    actor.rotation += actor.rx * seconds;

    actor.scale.x += (actor.sx * delta) / 1000;
    actor.scale.y += (actor.sy * delta) / 1000;
  }
}
