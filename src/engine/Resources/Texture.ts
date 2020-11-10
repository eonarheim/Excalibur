import { Resource } from './Resource';
import { Sprite } from '../Drawing/Sprite';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[Loadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 */
export class Texture extends Resource<string> {
  /**
   * The width of the texture in pixels
   */
  public width: number;

  /**
   * The height of the texture in pixels
   */
  public height: number;

  /**
   * A [[Promise]] that resolves when the Texture is loaded.
   */
  private _loadedResolve: (value?: HTMLImageElement) => void;
  public loaded: Promise<HTMLImageElement> = new Promise<HTMLImageElement>((resolve) => {
    this._loadedResolve = resolve;
  });

  private _isLoaded: boolean = false;
  private _sprite: Sprite = null;

  /**
   * Populated once loading is complete
   */
  public image: HTMLImageElement;

  /**
   * @param path       Path to the image resource or a base64 string representing an image "data:image/png;base64,iVB..."
   * @param bustCache  Optionally load texture with cache busting
   */
  constructor(public path: string, public bustCache = true) {
    super(path, 'blob', bustCache);
    this._sprite = new Sprite(this, 0, 0, 0, 0);
  }

  /**
   * Returns true if the Texture is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Begins loading the texture and returns a promise to be resolved on completion
   */
  public async load(): Promise<HTMLImageElement> {
    const complete = new Promise<HTMLImageElement>(async (resolve, reject) => {
      this.image = new Image();
      this.image.addEventListener('load', () => {
        this._isLoaded = true;
        this.width = this._sprite.width = this.image.naturalWidth;
        this.height = this._sprite.height = this.image.naturalHeight;
        this._sprite = new Sprite(this, 0, 0, this.width, this.height);
        this._loadedResolve(this.image);
        resolve(this.image);
      });
      if (this.path.indexOf('data:image/') > -1) {
        this.image.src = this.path;
        this.oncomplete();
      } else {
        try {
          this.image.src = await super.load();
        } catch (e) {
          reject('Error loading texture');
        }
      }
    });
    return complete;
  }

  public asSprite(): Sprite {
    return this._sprite;
  }
}
