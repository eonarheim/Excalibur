/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util.ts" />
/// <reference path="Actor.ts" />


module ex {

   /**
    * An enum that represents the types of emitter nozzles
    * @class EmitterType
    */ 
   export enum EmitterType {
      /**
       * Constant for the circular emitter type
       * @property Circle {EmitterType}
       */
      Circle,
      /**
       * Constant for the rectangular emitter type
       * @property Rectangle {EmitterType}
       */
      Rectangle
   }

   
   export class Particle {
      public position: Vector = new Vector(0, 0);
      public velocity: Vector = new Vector(0, 0);
      public acceleration: Vector = new Vector(0, 0);
      public focus: Vector = null;
      public focusAccel: number = 0;
      public opacity: number = 1;
      public beginColor: Color = Color.White.clone();
      public endColor: Color = Color.White.clone();

      // Life is counted in ms
      public life: number = 300;
      public fadeFlag: boolean = false;

      // Color transitions
      private _rRate: number = 1;
      private _gRate: number = 1;
      private _bRate: number = 1;
      private _aRate: number = 0;
      private _currentColor: Color = Color.White.clone();


      public emitter: ParticleEmitter = null;
      public particleSize: number = 5;
      public particleSprite: Sprite = null;

      public startSize: number;
      public endSize: number;
      public sizeRate: number = 0;
      public elapsedMultiplier: number = 0;

      constructor(emitter: ParticleEmitter, life?: number, opacity?: number, beginColor?: Color, endColor?: Color, position?: Vector, velocity?: Vector, acceleration?: Vector, startSize?: number, endSize?: number) {
         this.emitter = emitter;
         this.life = life || this.life;
         this.opacity = opacity || this.opacity;
         this.endColor = endColor || this.endColor.clone();
         this.beginColor = beginColor || this.beginColor.clone();
         this._currentColor = this.beginColor.clone();
         this.position = position || this.position;
         this.velocity = velocity || this.velocity;
         this.acceleration = acceleration || this.acceleration;
         this._rRate = (this.endColor.r - this.beginColor.r) / this.life;
         this._gRate = (this.endColor.g - this.beginColor.g) / this.life;
         this._bRate = (this.endColor.b - this.beginColor.b) / this.life;
         this._aRate = this.opacity / this.life;

         this.startSize = startSize || 0;
         this.endSize = endSize || 0;

         if ((this.endSize > 0) && (this.startSize > 0)) {
            this.sizeRate = (this.endSize - this.startSize) / this.life;
            this.particleSize = this.startSize;
         }
      }

      public kill() {
         this.emitter.removeParticle(this);
      }

      public update(delta: number) {
         this.life = this.life - delta;
         this.elapsedMultiplier = this.elapsedMultiplier + delta;
         
         if (this.life < 0) {
            this.kill();
         }

         if (this.fadeFlag) {
            this.opacity = ex.Util.clamp(this._aRate * this.life, 0.0001, 1);
         }

         if ((this.startSize > 0) && (this.endSize > 0)) {
               this.particleSize = ex.Util.clamp(this.sizeRate * delta + this.particleSize , Math.min(this.startSize, this.endSize), Math.max(this.startSize, this.endSize));
         }

         this._currentColor.r = ex.Util.clamp(this._currentColor.r + this._rRate * delta, 0, 255);
         this._currentColor.g = ex.Util.clamp(this._currentColor.g + this._gRate * delta, 0, 255);
         this._currentColor.b = ex.Util.clamp(this._currentColor.b + this._bRate * delta, 0, 255);
         this._currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);

         if (this.focus) {
            var accel = this.focus.minus(this.position).normalize().scale(this.focusAccel).scale(delta / 1000);
            this.velocity = this.velocity.add(accel);
         } else {
            this.velocity = this.velocity.add(this.acceleration.scale(delta / 1000));
         }
         this.position = this.position.add(this.velocity.scale(delta/1000));
      }

      public draw(ctx: CanvasRenderingContext2D) {
         if(this.particleSprite){
            this.particleSprite.draw(ctx, this.position.x, this.position.y);
            return;
         }

         this._currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);
         ctx.fillStyle = this._currentColor.toString();
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, this.particleSize, 0, Math.PI * 2);
         ctx.fill();
         ctx.closePath();
      }
   }

   /**
    * Using a particle emitter is a great way to create interesting effects 
    * in your game, like smoke, fire, water, explosions, etc. Particle Emitters
    * extend Actor allowing you to use all of the features that come with Actor
    * @class ParticleEmitter
    * @constructor
    * @param [x=0] {number} The x position of the emitter
    * @param [y=0] {number} The y position of the emitter
    * @param [width=0] {number} The width of the emitter
    * @param [height=0] {number} The height of the emitter
    */
   export class ParticleEmitter extends Actor {

      private _particlesToEmit: number = 0;

      public numParticles: number = 0;

      /**
       * Gets or sets the isEmitting flag
       * @property isEmitting {boolean}
       */
      public isEmitting: boolean = true;
      /**
       * Gets or sets the backing particle collection
       * @property particles {Util.Collection&lt;Particle&gt;}
       */
      public particles: Util.Collection<Particle> = null;

      /**
       * Gets or sets the backing deadParticle collection
       * @property particles {Util.Collection&lt;Particle&gt;}
       */
      public deadParticles: Util.Collection<Particle> = null;

      /**
       * Gets or sets the minimum partical velocity
       * @property [minVel=0] {number} 
       */
      public minVel: number = 0;
      /**
       * Gets or sets the maximum partical velocity
       * @property [maxVel=0] {number} 
       */
      public maxVel: number = 0;

      /**
       * Gets or sets the acceleration vector for all particles
       * @property [acceleration=new Vector(0,0)] {Vector} 
       */
      public acceleration: Vector = new Vector(0, 0);

      /**
       * Gets or sets the minimum angle in radians
       * @property [minAngle=0] {number} 
       */
      public minAngle: number = 0;
      /**
       * Gets or sets the maximum angle in radians
       * @property [maxAngle=0] {number} 
       */
      public maxAngle: number = 0;

      /**
       * Gets or sets the emission rate for particles (particles/sec)
       * @property [emitRate=1] {number}
       */
      public emitRate: number = 1; //particles/sec
      /**
       * Gets or sets the life of each particle in milliseconds
       * @property [particleLife=2000] {number}
       */
      public particleLife: number = 2000;
      /**
       * Gets or sets the opacity of each particle from 0 to 1.0
       * @property [opacity=1.0] {number}
       */
      public opacity: number = 1;
      /**
       * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
       * @property [fade=false] {boolean}
       */
      public fadeFlag: boolean = false;

      /**
       * Gets or sets the optional focus where all particles should accelerate towards
       * @property [focus=null] {Vector}
       */
      public focus: Vector = null;
      /**
       * Gets or sets the acceleration for focusing particles if a focus has been specified
       * @property [focusAccel=1] {number}
       */
      public focusAccel: number = 1;
      /*
       * Gets or sets the optional starting size for the particles
       * @property [startSize=null] {number}
       */
      public startSize: number = null;
      /*
       * Gets or sets the optional ending size for the particles
       * @property [endSize=null] {number}
       */
      public endSize: number = null;

      /**
       * Gets or sets the minimum size of all particles
       * @property [minSize=5] {number}
       */
      public minSize: number = 5;
      /**
       * Gets or sets the maximum size of all particles
       * @property [maxSize=5] {number}
       */
      public maxSize: number = 5;

      /**
       * Gets or sets the beginning color of all particles
       * @property [beginColor=Color.White] {Color}
       */
      public beginColor: Color = Color.White;
      /**
       * Gets or sets the ending color of all particles
       * @property [endColor=Color.White] {Color}
       */
      public endColor: Color = Color.White;

      /**
       * Gets or sets the sprite that a particle should use
       * @property [particleSprite=null] {Sprite}
       */
      public particleSprite: ex.Sprite = null;

      /**
       * Gets or sets the emitter type for the particle emitter
       * @property [emitterType=EmitterType.Rectangle] {EmitterType}
       */
      public emitterType: ex.EmitterType = EmitterType.Rectangle;

      /**
       * Gets or sets the emitter radius, only takes effect when the emitterType is Circle
       * @property [radius=0] {number}
       */
      public radius: number = 0;

      constructor(x?: number, y?: number, width?: number, height?: number) {    
         super(x, y, width, height, Color.White);
         this.collisionType = CollisionType.PreventCollision;
         this.particles = new Util.Collection<Particle>();
         this.deadParticles = new Util.Collection<Particle>();
      }

      public removeParticle(particle: Particle) {
         this.deadParticles.push(particle);
      }

      /**
       * Causes the emitter to emit particles
       * @method emit
       * @param particleCount {number} Number of particles to emit right now
       */
      public emit(particleCount: number) {
         for (var i = 0; i < particleCount; i++) {
            this.particles.push(this._createParticle());
         }
      }

      public clearParticles() {
         this.particles.clear();
      }

      // Creates a new particle given the contraints of the emitter
      private _createParticle(): Particle {
         // todo implement emitter contraints;
         var ranX = 0;
         var ranY = 0;

         var angle = Util.randomInRange(this.minAngle, this.maxAngle);
         var vel = Util.randomInRange(this.minVel, this.maxVel);
         var size = this.startSize || Util.randomInRange(this.minSize, this.maxSize);
         var dx = vel * Math.cos(angle);
         var dy = vel * Math.sin(angle);

         if(this.emitterType === EmitterType.Rectangle){
            ranX = Util.randomInRange(this.x, this.x + this.getWidth());
            ranY = Util.randomInRange(this.y, this.y + this.getHeight());
         }else if(this.emitterType === EmitterType.Circle){
            var radius = Util.randomInRange(0, this.radius);
            ranX = radius * Math.cos(angle) + this.x;
            ranY = radius * Math.sin(angle) + this.y;
         }         
         
         var p = new Particle(this, this.particleLife, this.opacity, this.beginColor, this.endColor, new Vector(ranX, ranY), new Vector(dx, dy), this.acceleration, this.startSize, this.endSize);
         p.fadeFlag = this.fadeFlag;
         p.particleSize = size;
         p.particleSprite = this.particleSprite;
         if (this.focus) {
            p.focus = this.focus.add(new ex.Vector(this.x, this.y));
            p.focusAccel = this.focusAccel;
         }
         return p;
      }
      
      public update(engine: Engine, delta: number) {
         super.update(engine, delta);
         if (this.isEmitting) {
            this._particlesToEmit += this.emitRate * (delta / 1000);
            var numParticles = Math.ceil(this.emitRate * delta / 1000);
            if (this._particlesToEmit > 1.0) {
               this.emit(Math.floor(this._particlesToEmit));
               this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
            }
         }

         this.particles.forEach((particle: Particle, index: number) => {
            particle.update(delta);
         });

         this.deadParticles.forEach((particle: Particle, index: number) => {
            this.particles.removeElement(particle);
         });
         this.deadParticles.clear();
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {
         this.particles.forEach((particle: Particle, index: number) => {
            // todo is there a more efficient to draw 
            // possibly use a webgl offscreen canvas and shaders to do particles?
            particle.draw(ctx);
         });
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         super.debugDraw(ctx);
         ctx.fillStyle = Color.Black.toString();
         ctx.fillText("Particles: " + this.particles.count(), this.x, this.y + 20);

         if (this.focus) {
            ctx.fillRect(this.focus.x + this.x, this.focus.y + this.y, 3, 3);
            Util.drawLine(ctx, "yellow", this.focus.x + this.x, this.focus.y + this.y, super.getCenter().x, super.getCenter().y);
            ctx.fillText("Focus", this.focus.x + this.x, this.focus.y + this.y);
         }
      }

   }
}