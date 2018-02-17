import { Engine } from './Engine';
import { EasingFunction, EasingFunctions } from './Util/EasingFunctions';
import { IPromise, Promise, PromiseState } from './Promises';
import { Vector } from './Algebra';
import { Actor } from './Actor';
import { removeItemFromArray } from './Util/Util';

/**
 * Interface that describes a custom camera strategy for tracking targets
 */
export interface ICameraStrategy<T> {
   /**
    * Target of the camera strategy that will be passed to the action
    */
   target: T;

   /**
    * Camera strategies perform an action to calculate a new focus returned out of the strategy
    * @param target The target object to apply this camera strategy (if any)
    * @param camera The current camera implementation in excalibur running the game
    * @param engine The current engine running the game
    * @param delta The elapsed time in milliseconds since the last frame
    */
   action: (target: T, camera: BaseCamera, engine: Engine, delta: number) => Vector;
}


/**
 * Container to house convenience strategy methods
 * @internal
 */
export class StrategyContainer {
   constructor(public camera: BaseCamera) {}
   
   /**
    * Creates and adds the [[LockCameraToActorStrategy]] on the current camera.
    * @param actor The actor to lock the camera to
    */
   public lockToActor(actor: Actor) {
      this.camera.addStrategy(new LockCameraToActorStrategy(actor));
   }

   /**
    * Creates and adds the [[LockCameraToActorAxisStrategy]] on the current camera
    * @param actor The actor to lock the camera to
    * @param axis The axis to follow the actor on
    */
   public lockToActorAxis(actor: Actor, axis: Axis) {
      this.camera.addStrategy(new LockCameraToActorAxisStrategy(actor, axis));
   }

   /**
    * Creates and adds the [[ElasticToActorStrategy]] on the current camera
    * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
    * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillationg spring that will over 
    * correct and bounce around the target
    * 
    * @param target Target actor to elastically follow
    * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
    * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
    */
   public elasticToActor(actor: Actor, cameraElasticity: number, cameraFriction: number) {
      this.camera.addStrategy(new ElasticToActorStrategy(actor, cameraElasticity, cameraFriction));
   }

   /**
    * Creates and adds the [[RadiusAroundActorStrategy]] on the current camera
    * @param target Target actor to follow when it is "radius" pixels away
    * @param radius Number of pixels away before the camera will follow
    */
   public radiusAroundActor(actor: Actor, radius: number) {
      this.camera.addStrategy(new RadiusAroundActorStrategy(actor, radius));
   }
}


/**
 * Camera axis enum
 */
export enum Axis {
   X,
   Y
}

/**
 * Lock a camera to the exact x/y postition of an actor.
 */
export class LockCameraToActorStrategy implements ICameraStrategy<Actor> {
   constructor(public target: Actor) {}
   public action = (target: Actor, _cam: BaseCamera, _eng: Engine, _delta: number) => {
      let center = target.getCenter();
      return center;
   }
}

/**
 * Lock a camera to a specific axis around an actor.
 */
export class LockCameraToActorAxisStrategy implements ICameraStrategy<Actor> {
   constructor(public target: Actor, public axis: Axis) {}
   public action = (target: Actor, cam: BaseCamera, _eng: Engine, _delta: number) => {
      let center = target.getCenter();
      let currentFocus = cam.getFocus();
      if (this.axis === Axis.X) {
         return new Vector(center.x, currentFocus.y);
      } else {
         return new Vector(currentFocus.x, center.y);
      }
   }
}



/**
 * Using [Hook's law](https://en.wikipedia.org/wiki/Hooke's_law), elastically move the camera towards the target actor.
 */
export class ElasticToActorStrategy implements ICameraStrategy<Actor> {
   /**
    * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
    * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillationg spring that will over 
    * correct and bounce around the target
    * 
    * @param target Target actor to elastically follow
    * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
    * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
    */
   constructor(public target: Actor, public cameraElasticity: number, public cameraFriction: number) {}
   public action = (target: Actor, cam: BaseCamera, _eng: Engine, _delta: number) => {
      let position = target.getCenter();
      let focus = cam.getFocus();
      let cameraVel = new Vector(cam.dx, cam.dy);

      // Calculate the strech vector, using the spring equation
      // F = kX
      // https://en.wikipedia.org/wiki/Hooke's_law
      // Apply to the current camera velocity
      var stretch = position.sub(focus).scale(this.cameraElasticity); // stretch is X
      cameraVel = cameraVel.add(stretch);
      
      // Calculate the friction (-1 to apply a force in the opposition of motion)
      // Apply to the current camera velocity
      var friction = cameraVel.scale(-1).scale(this.cameraFriction);
      cameraVel = cameraVel.add(friction);
      
      // Update position by velocity deltas
      focus = focus.add(cameraVel);

      return focus;
   }
}

export class RadiusAroundActorStrategy implements ICameraStrategy<Actor> {
   /**
    * 
    * @param target Target actor to follow when it is "radius" pixels away
    * @param radius Number of pixels away before the camera will follow
    */
   constructor(public target: Actor, public radius: number) {}
   public action = (target: Actor, cam: BaseCamera, _eng: Engine, _delta: number) => {
      let position = target.getCenter();
      let focus = cam.getFocus();

      let direction = position.sub(focus);
      let distance = direction.magnitude();
      if (distance >= this.radius) {
         let offset = distance - this.radius;
         return focus.add(direction.normalize().scale(offset));
      }
      return focus;
   }
}


/**
 * Cameras
 *
 * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 * [[include:Cameras.md]]
 */
export class BaseCamera {
   protected _follow: Actor;

   private _cameraStrategies: ICameraStrategy<any>[] = [];

   public strategy: StrategyContainer = new StrategyContainer(this);

   // camera physical quantities
   public z: number = 1;

   public dx: number = 0;
   public dy: number = 0;
   public dz: number = 0;

   public ax: number = 0;
   public ay: number = 0;
   public az: number = 0;

   public rotation: number = 0;
   public rx: number = 0;

   private _x: number = 0;
   private _y: number = 0;
   private _cameraMoving: boolean = false;
   private _currentLerpTime: number = 0;
   private _lerpDuration: number = 1000; // 1 second   
   private _lerpStart: Vector = null;
   private _lerpEnd: Vector = null;
   private _lerpPromise: IPromise<Vector>;

   //camera effects
   protected _isShaking: boolean = false;
   private _shakeMagnitudeX: number = 0;
   private _shakeMagnitudeY: number = 0;
   private _shakeDuration: number = 0;
   private _elapsedShakeTime: number = 0;
   private _xShake: number = 0;
   private _yShake: number = 0;

   protected _isZooming: boolean = false;
   private _maxZoomScale: number = 1;
   private _zoomPromise: Promise<boolean>;
   private _zoomIncrement: number = 0.01;
   private _easing: EasingFunction = EasingFunctions.EaseInOutCubic;
 
   /**
    * Get the camera's x position
    */
   public get x() {
      return this._x;
   }

   /**
    * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
    */
   public set x(value: number) {
      if (!this._follow && !this._cameraMoving) {
         this._x = value;
      }
   }

   /**
    * Get the camera's y position 
    */
   public get y() {
      return this._y;
   }

   /**
    * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
    */
   public set y(value: number) {
      if (!this._follow && !this._cameraMoving) {
         this._y = value;
      }
   }

   /**
    * Get the camera's position as a vector
    */
   public get pos(): Vector {
      return new Vector(this.x, this.y);
   }

   /**
    * Set the cameras position
    */
   public set pos(value: Vector) {
      this.x = value.x;
      this.y = value.y;
   }

   /**
    * Get the camera's velocity as a vector
    */
   public get vel() {
      return new Vector(this.dx, this.dy);
   }

   /**
    * Set the camera's velocity
    */
   public set vel(value: Vector) {
      this.dx = value.x;
      this.dy = value.y;
   }

   /**
    * Returns the focal point of the camera, a new point giving the x and y position of the camera
    */
   public getFocus() {
      return new Vector(this.x, this.y);
   }

   /**
    * This moves the camera focal point to the specified position using specified easing function. Cannot move when following an Actor.
    * 
    * @param pos The target position to move to
    * @param duration The duration in milliseconds the move should last
    * @param [easingFn] An optional easing function ([[ex.EasingFunctions.EaseInOutCubic]] by default)
    * @returns A [[Promise]] that resolves when movement is finished, including if it's interrupted. 
    *          The [[Promise]] value is the [[Vector]] of the target position. It will be rejected if a move cannot be made.
    */
   public move(pos: Vector, duration: number, easingFn: EasingFunction = EasingFunctions.EaseInOutCubic): IPromise<Vector> {

      if (typeof easingFn !== 'function') {
         throw 'Please specify an EasingFunction';
      }

      // cannot move when following an actor
      if (this._follow) {
         return new Promise<Vector>().reject(pos);
      }

      // resolve existing promise, if any
      if (this._lerpPromise && this._lerpPromise.state() === PromiseState.Pending) {
         this._lerpPromise.resolve(pos);
      }

      this._lerpPromise = new Promise<Vector>();
      this._lerpStart = this.getFocus().clone();
      this._lerpDuration = duration;
      this._lerpEnd = pos;
      this._currentLerpTime = 0;
      this._cameraMoving = true;
      this._easing = easingFn;

      return this._lerpPromise;
   }

   /**
    * Sets the camera to shake at the specified magnitudes for the specified duration
    * @param magnitudeX  The x magnitude of the shake
    * @param magnitudeY  The y magnitude of the shake
    * @param duration    The duration of the shake in milliseconds
    */
   public shake(magnitudeX: number, magnitudeY: number, duration: number) {
      this._isShaking = true;
      this._shakeMagnitudeX = magnitudeX;
      this._shakeMagnitudeY = magnitudeY;
      this._shakeDuration = duration;
   }

   /**
    * Zooms the camera in or out by the specified scale over the specified duration. 
    * If no duration is specified, it take effect immediately.
    * @param scale    The scale of the zoom
    * @param duration The duration of the zoom in milliseconds
    */
   public zoom(scale: number, duration: number = 0): Promise<boolean> {
      this._zoomPromise = new Promise<boolean>();
      
      if (duration) {
         this._isZooming = true;
         this._maxZoomScale = scale;
         this._zoomIncrement = (scale - this.z) / duration;
      } else {
         this._isZooming = false;
         this.z = scale;
         this._zoomPromise.resolve(true);
         
      }

      return this._zoomPromise;
   }

   /**
    * Gets the current zoom scale
    */
   public getZoom() {
      return this.z;
   }

   /**
    * Adds a new camera strategy to this camera
    * @param cameraStrategy Instance of an [[ICameraStrategy]]
    */
   public addStrategy<T>(cameraStrategy: ICameraStrategy<T>) {
      this._cameraStrategies.push(cameraStrategy);
   }

   /**
    * Removes a camera strategy by reference
    * @param cameraStrategy Instance of an [[ICameraStrategy]]
    */
   public removeStrategy<T>(cameraStrategy: ICameraStrategy<T>) {
      removeItemFromArray(cameraStrategy, this._cameraStrategies);
   }

   /**
    * Clears all camera strategies from the camera
    */
   public clearAllStrategies() {
      this._cameraStrategies.length = 0;
   }

   public update(_engine: Engine, delta: number) {

      // Update placements based on linear algebra
      this._x += this.dx * delta / 1000;
      this._y += this.dy * delta / 1000;
      this.z += this.dz * delta / 1000;

      this.dx += this.ax * delta / 1000;
      this.dy += this.ay * delta / 1000;
      this.dz += this.az * delta / 1000;

      this.rotation += this.rx * delta / 1000;

      if (this._isZooming) {
         var newZoom = this.z + this._zoomIncrement * delta;      
         this.z = newZoom;
         if (this._zoomIncrement > 0) {
               
            if (newZoom >= this._maxZoomScale) {
               this._isZooming = false;
               this.z = this._maxZoomScale;
               this._zoomPromise.resolve(true);
            }
         } else {
            if (newZoom <= this._maxZoomScale) {
               this._isZooming = false;
               this.z = this._maxZoomScale;
               this._zoomPromise.resolve(true);
            }
         }         
      }

      if (this._cameraMoving) {
         if (this._currentLerpTime < this._lerpDuration) {

            if (this._lerpEnd.x < this._lerpStart.x) {
               this._x = this._lerpStart.x - (this._easing(this._currentLerpTime,
                  this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
            } else {
               this._x = this._easing(this._currentLerpTime,
                  this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
            }

            if (this._lerpEnd.y < this._lerpStart.y) {
               this._y = this._lerpStart.y - (this._easing(this._currentLerpTime,
                  this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
            } else {
               this._y = this._easing(this._currentLerpTime,
                  this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
            }
            this._currentLerpTime += delta;
         } else {
            this._x = this._lerpEnd.x;
            this._y = this._lerpEnd.y;
            this._lerpPromise.resolve(this._lerpEnd);
            this._lerpStart = null;
            this._lerpEnd = null;
            this._currentLerpTime = 0;
            this._cameraMoving = false;
         }
      }

      if (this._isDoneShaking()) {
         this._isShaking = false;
         this._elapsedShakeTime = 0;
         this._shakeMagnitudeX = 0;
         this._shakeMagnitudeY = 0;
         this._shakeDuration = 0;
         this._xShake = 0;
         this._yShake = 0;
      } else {
         this._elapsedShakeTime += delta;
         this._xShake = (Math.random() * this._shakeMagnitudeX | 0) + 1;
         this._yShake = (Math.random() * this._shakeMagnitudeY | 0) + 1;
      }

      for (let s of this._cameraStrategies) {
         this.pos = s.action.call(s, s.target, this, _engine, delta);
      }
   }

   /**
    * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
    * @param ctx    Canvas context to apply transformations
    * @param delta  The number of milliseconds since the last update
    */
   public draw(ctx: CanvasRenderingContext2D) {
      let focus = this.getFocus();
      let canvasWidth = ctx.canvas.width;
      let canvasHeight = ctx.canvas.height;
      let pixelRatio = window.devicePixelRatio;
      let zoom = this.getZoom();

      var newCanvasWidth = (canvasWidth / zoom) / pixelRatio;
      var newCanvasHeight = (canvasHeight / zoom) / pixelRatio;

      ctx.scale(zoom, zoom);
      ctx.translate(-focus.x + newCanvasWidth / 2 + this._xShake, -focus.y + newCanvasHeight / 2 + this._yShake);
   }

   public debugDraw(ctx: CanvasRenderingContext2D) {
      var focus = this.getFocus();
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(focus.x, focus.y, 15, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(focus.x, focus.y, 5, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
   }

   private _isDoneShaking(): boolean {
      return !(this._isShaking) || (this._elapsedShakeTime >= this._shakeDuration);
   }
}