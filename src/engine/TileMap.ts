import { BoundingBox } from './Collision/BoundingBox';
import { Color } from './Drawing/Color';
import { Engine } from './Engine';
import { vec, Vector } from './Algebra';
import { Actor } from './Actor';
import { Logger } from './Util/Log';
import { SpriteSheet } from './Drawing/SpriteSheet';
import * as Events from './Events';
import { Configurable } from './Configurable';
import { Entity } from './EntityComponentSystem/Entity';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { ExcaliburGraphicsContext, GraphicsComponent } from './Graphics';
import * as Graphics from './Graphics';
import { CanvasDrawComponent, Sprite } from './Drawing/Index';
import { Sprite as LegacySprite } from './Drawing/Index';
import { removeItemFromArray } from './Util/Util';
import { obsolete } from './Util/Decorators';

/**
 * @hidden
 */
export class TileMapImpl extends Entity<TransformComponent | GraphicsComponent> {
  private _collidingX: number = -1;
  private _collidingY: number = -1;
  private _onScreenXStart: number = 0;
  private _onScreenXEnd: number = 9999;
  private _onScreenYStart: number = 0;
  private _onScreenYEnd: number = 9999;
  private _spriteSheets: { [key: string]: Graphics.SpriteSheet } = {};

  private _legacySpriteMap = new Map<Graphics.Sprite, Sprite>();
  public logger: Logger = Logger.getInstance();
  public data: Cell[] = [];
  public visible = true;
  public isOffscreen = false;
  public cellWidth: number;
  public cellHeight: number;
  public rows: number;
  public cols: number;

  private _transform: TransformComponent;

  public get x(): number {
    return this._transform.pos.x ?? 0;
  }

  public set x(val: number) {
    if (this._transform?.pos) {
      this.get(TransformComponent).pos = vec(val, this.y);
    }
  }

  public get y(): number {
    return this._transform?.pos.y ?? 0;
  }

  public set y(val: number) {
    if (this._transform?.pos) {
      this._transform.pos = vec(this.x, val);
    }
  }

  public get z(): number {
    return this._transform.z ?? 0;
  }

  public set z(val: number) {
    if (this._transform?.z) {
      this._transform.z = val;
    }
  }

  public get rotation(): number {
    return this._transform?.rotation ?? 0;
  }

  public set rotation(val: number) {
    if (this._transform?.rotation) {
      this._transform.rotation = val;
    }
  }

  public get scale(): Vector {
    return this._transform?.scale ?? Vector.One;
  }
  public set scale(val: Vector) {
    if (this._transform?.scale) {
      this._transform.scale = val;
    }
  }

  public get pos(): Vector {
    return this._transform.pos;
  }

  public set pos(val: Vector) {
    this._transform.pos = val;
  }

  public on(eventName: Events.preupdate, handler: (event: Events.PreUpdateEvent<TileMap>) => void): void;
  public on(eventName: Events.postupdate, handler: (event: Events.PostUpdateEvent<TileMap>) => void): void;
  public on(eventName: Events.predraw, handler: (event: Events.PreDrawEvent) => void): void;
  public on(eventName: Events.postdraw, handler: (event: Events.PostDrawEvent) => void): void;
  public on(eventName: string, handler: (event: Events.GameEvent<any>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    super.on(eventName, handler);
  }

  /**
   * @param xOrConfig     The x coordinate to anchor the TileMap's upper left corner (should not be changed once set) or TileMap option bag
   * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
   * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
   * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
   * @param rows          The number of rows in the TileMap (should not be changed once set)
   * @param cols          The number of cols in the TileMap (should not be changed once set)
   */
  constructor(xOrConfig: number | TileMapArgs, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number) {
    super([
      new TransformComponent(),
      new GraphicsComponent({
        onPostDraw: (ctx, delta) => this.draw(ctx, delta)
      }),
      new CanvasDrawComponent((ctx, delta) => this.draw(ctx, delta))
    ]);

    if (xOrConfig && typeof xOrConfig === 'object') {
      const config = xOrConfig;
      xOrConfig = config.x;
      y = config.y;
      cellWidth = config.cellWidth;
      cellHeight = config.cellHeight;
      rows = config.rows;
      cols = config.cols;
    }
    this.x = <number>xOrConfig;
    this.y = y;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.rows = rows;
    this.cols = cols;
    this.data = new Array<Cell>(rows * cols);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        (() => {
          const cd = new Cell(i * cellWidth + <number>xOrConfig, j * cellHeight + y, cellWidth, cellHeight, i + j * cols);
          this.data[i + j * cols] = cd;
        })();
      }
    }
    this._transform = this.get(TransformComponent);
    this.get(GraphicsComponent).localBounds = new BoundingBox({
      left: 0,
      top: 0,
      right: this.cols * this.cellWidth,
      bottom: this.rows * this.cellHeight
    });
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
  }

  /**
   *
   * @param key
   * @param spriteSheet
   * @deprecated No longer used, will be removed in v0.26.0
   */
  public registerSpriteSheet(key: string, spriteSheet: SpriteSheet): void;
  public registerSpriteSheet(key: string, spriteSheet: Graphics.SpriteSheet): void;
  @obsolete({ message: 'No longer used, will be removed in v0.26.0' })
  public registerSpriteSheet(key: string, spriteSheet: SpriteSheet | Graphics.SpriteSheet): void {
    if (spriteSheet instanceof Graphics.SpriteSheet) {
      this._spriteSheets[key] = spriteSheet;
    } else {
      this._spriteSheets[key] = Graphics.SpriteSheet.fromLegacySpriteSheet(spriteSheet);
    }
  }

  /**
   * Returns the intersection vector that can be used to resolve collisions with actors. If there
   * is no collision null is returned.
   */
  public collides(actor: Actor): Vector {
    const width = actor.pos.x + actor.width;
    const height = actor.pos.y + actor.height;
    const actorBounds = actor.body.collider.bounds;
    const overlaps: Vector[] = [];
    if (actor.width <= 0 || actor.height <= 0) {
      return null;
    }
    // trace points for overlap
    for (let x = actorBounds.left; x <= width; x += Math.min(actor.width / 2, this.cellWidth / 2)) {
      for (let y = actorBounds.top; y <= height; y += Math.min(actor.height / 2, this.cellHeight / 2)) {
        const cell = this.getCellByPoint(x, y);
        if (cell && cell.solid) {
          const overlap = actorBounds.intersect(cell.bounds);
          const dir = actor.center.sub(cell.center);
          if (overlap && overlap.dot(dir) > 0) {
            overlaps.push(overlap);
          }
        }
      }
    }
    if (overlaps.length === 0) {
      return null;
    }
    // Return the smallest change other than zero
    const result = overlaps.reduce((accum, next) => {
      let x = accum.x;
      let y = accum.y;
      if (Math.abs(accum.x) < Math.abs(next.x)) {
        x = next.x;
      }
      if (Math.abs(accum.y) < Math.abs(next.y)) {
        y = next.y;
      }
      return new Vector(x, y);
    });
    return result;
  }

  /**
   * Returns the [[Cell]] by index (row major order)
   */
  public getCellByIndex(index: number): Cell {
    return this.data[index];
  }
  /**
   * Returns the [[Cell]] by its x and y coordinates
   */
  public getCell(x: number, y: number): Cell {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
      return null;
    }
    return this.data[x + y * this.cols];
  }
  /**
   * Returns the [[Cell]] by testing a point in global coordinates,
   * returns `null` if no cell was found.
   */
  public getCellByPoint(x: number, y: number): Cell {
    x = Math.floor((x - this.x) / this.cellWidth);
    y = Math.floor((y - this.y) / this.cellHeight);
    const cell = this.getCell(x, y);
    if (x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell) {
      return cell;
    }
    return null;
  }

  public onPreUpdate(_engine: Engine, _delta: number) {
    // Override me
  }

  public onPostUpdate(_engine: Engine, _delta: number) {
    // Override me
  }

  public update(engine: Engine, delta: number) {
    this.onPreUpdate(engine, delta);
    this.emit('preupdate', new Events.PreUpdateEvent(engine, delta, this));

    const worldBounds = engine.getWorldBounds();
    const worldCoordsUpperLeft = vec(worldBounds.left, worldBounds.top);
    const worldCoordsLowerRight = vec(worldBounds.right, worldBounds.bottom);

    this._onScreenXStart = Math.max(Math.floor((worldCoordsUpperLeft.x - this.x) / this.cellWidth) - 2, 0);
    this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2, 0);
    this._onScreenXEnd = Math.max(Math.floor((worldCoordsLowerRight.x - this.x) / this.cellWidth) + 2, 0);
    this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2, 0);
    this._transform.pos = vec(this.x, this.y);

    this.onPostUpdate(engine, delta);
    this.emit('postupdate', new Events.PostUpdateEvent(engine, delta, this));
  }

  /**
   * Draws the tile map to the screen. Called by the [[Scene]].
   * @param ctx CanvasRenderingContext2D or ExcaliburGraphicsContext
   * @param delta  The number of milliseconds since the last draw
   */
  public draw(ctx: CanvasRenderingContext2D | ExcaliburGraphicsContext, delta: number): void {
    this.emit('predraw', new Events.PreDrawEvent(ctx as any, delta, this)); // TODO fix event

    let x = this._onScreenXStart;
    const xEnd = Math.min(this._onScreenXEnd, this.cols);
    let y = this._onScreenYStart;
    const yEnd = Math.min(this._onScreenYEnd, this.rows);

    let sprites: Graphics.Sprite[], spriteIndex: number, cslen: number;

    for (x; x < xEnd; x++) {
      for (y; y < yEnd; y++) {
        // get non-negative tile sprites
        sprites = this.getCell(x, y).sprites;

        for (spriteIndex = 0, cslen = sprites.length; spriteIndex < cslen; spriteIndex++) {
          // draw sprite, warning if sprite doesn't exist
          const sprite = sprites[spriteIndex];
          if (sprite) {
            if (!(ctx instanceof CanvasRenderingContext2D)) {
              sprite.draw(ctx, x * this.cellWidth, y * this.cellHeight);
            } else {
              // TODO legacy drawing mode
              if (!this._legacySpriteMap.has(sprite)) {
                this._legacySpriteMap.set(sprite, Graphics.Sprite.toLegacySprite(sprite));
              }
              this._legacySpriteMap.get(sprite).draw(ctx, x * this.cellWidth, y * this.cellHeight);
            }
          }
        }
      }
      y = this._onScreenYStart;
    }

    this.emit('postdraw', new Events.PostDrawEvent(ctx as any, delta, this));
  }

  /**
   * Draws all the tile map's debug info. Called by the [[Scene]].
   * @param ctx  The current rendering context
   */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    const width = this.cols * this.cellWidth;
    const height = this.rows * this.cellHeight;
    ctx.save();
    ctx.strokeStyle = Color.Red.toString();
    for (let x = 0; x < this.cols + 1; x++) {
      ctx.beginPath();
      ctx.moveTo(this.x + x * this.cellWidth, this.y);
      ctx.lineTo(this.x + x * this.cellWidth, this.y + height);
      ctx.stroke();
    }
    for (let y = 0; y < this.rows + 1; y++) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + y * this.cellHeight);
      ctx.lineTo(this.x + width, this.y + y * this.cellHeight);
      ctx.stroke();
    }
    const solid = Color.Red;
    solid.a = 0.3;
    this.data
      .filter(function (cell) {
        return cell.solid;
      })
      .forEach(function (cell) {
        ctx.fillStyle = solid.toString();
        ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
      });
    if (this._collidingY > -1 && this._collidingX > -1) {
      ctx.fillStyle = Color.Cyan.toString();
      ctx.fillRect(
        this.x + this._collidingX * this.cellWidth,
        this.y + this._collidingY * this.cellHeight,
        this.cellWidth,
        this.cellHeight
      );
    }
    ctx.restore();
  }
}

export interface TileMapArgs extends Partial<TileMapImpl> {
  x: number;
  y: number;
  cellWidth: number;
  cellHeight: number;
  rows: number;
  cols: number;
}

/**
 * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
 * without the overhead of actors.
 */
export class TileMap extends Configurable(TileMapImpl) {
  constructor(config: TileMapArgs);
  constructor(x: number, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number);
  constructor(xOrConfig: number | TileMapArgs, y?: number, cellWidth?: number, cellHeight?: number, rows?: number, cols?: number) {
    super(xOrConfig, y, cellWidth, cellHeight, rows, cols);
  }
}

/**
 * @hidden
 */
export class CellImpl extends Entity<TransformComponent | GraphicsComponent> {
  private _bounds: BoundingBox;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public index: number;
  public solid: boolean = false;
  public sprites: Graphics.Sprite[] = [];

  // public transform: TransformComponent;
  // public graphics: GraphicsComponent;

  /**
   * @param xOrConfig Gets or sets x coordinate of the cell in world coordinates or cell option bag
   * @param y       Gets or sets y coordinate of the cell in world coordinates
   * @param width   Gets or sets the width of the cell
   * @param height  Gets or sets the height of the cell
   * @param index   The index of the cell in row major order
   * @param solid   Gets or sets whether this cell is solid
   * @param sprites The list of tile sprites to use to draw in this cell (in order)
   */
  constructor(
    xOrConfig: number | CellArgs,
    y: number,
    width: number,
    height: number,
    index: number,
    solid: boolean = false,
    sprites: Graphics.Sprite[] = []
  ) {
    super();
    if (xOrConfig && typeof xOrConfig === 'object') {
      const config = xOrConfig;
      xOrConfig = config.x;
      y = config.y;
      width = config.width;
      height = config.height;
      index = config.index;
      solid = config.solid;
      sprites = config.sprites;
    }
    this.x = <number>xOrConfig;
    this.y = y;
    this.width = width;
    this.height = height;
    this.index = index;
    this.solid = solid;
    this.sprites = sprites;
    this._bounds = new BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
  }

  public get bounds() {
    return this._bounds;
  }

  public get center(): Vector {
    return new Vector(this.x + this.width / 2, this.y + this.height / 2);
  }

  /**
   * Add another [[Sprite]] to this cell
   * @deprecated Use addSprite, will be removed in v0.26.0
   */
  @obsolete({ message: 'Will be removed in v0.26.0', alternateMethod: 'addSprite' })
  public pushSprite(sprite: Graphics.Sprite | LegacySprite) {
    this.addSprite(sprite);
  }

  /**
   * Add another [[Sprite]] to this TileMap cell
   * @param sprite
   */
  public addSprite(sprite: Graphics.Sprite | LegacySprite) {
    if (sprite instanceof LegacySprite) {
      this.sprites.push(Graphics.Sprite.fromLegacySprite(sprite));
    } else {
      this.sprites.push(sprite);
    }
  }

  /**
   * Remove an instance of [[Sprite]] from this cell
   */
  public removeSprite(sprite: Graphics.Sprite | LegacySprite) {
    removeItemFromArray(sprite, this.sprites);
  }
  /**
   * Clear all sprites from this cell
   */
  public clearSprites() {
    this.sprites.length = 0;
  }
}

export interface CellArgs extends Partial<CellImpl> {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  solid?: boolean;
  sprites?: Graphics.Sprite[];
}

/**
 * TileMap Cell
 *
 * A light-weight object that occupies a space in a collision map. Generally
 * created by a [[TileMap]].
 *
 * Cells can draw multiple sprites. Note that the order of drawing is the order
 * of the sprites in the array so the last one will be drawn on top. You can
 * use transparency to create layers this way.
 */
export class Cell extends Configurable(CellImpl) {
  constructor(config: CellArgs);
  constructor(x: number, y: number, width: number, height: number, index: number, solid?: boolean, sprites?: Graphics.Sprite[]);
  constructor(
    xOrConfig: number | CellArgs,
    y?: number,
    width?: number,
    height?: number,
    index?: number,
    solid?: boolean,
    sprites?: Graphics.Sprite[]
  ) {
    super(xOrConfig, y, width, height, index, solid, sprites);
  }
}
