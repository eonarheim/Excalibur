import { GraphicOptions } from './Graphic';
import { Raster } from './Raster';

export interface CanvasOptions {
  drawHandler: (ctx: CanvasRenderingContext2D, delta: number) => void;
}

/**
 * A canvas [[Graphic]] to provide an adapter between the 2D Canvas API and the [[ExcaliburGraphicsContext]].
 *
 * The [[Canvas]] works by re-rastering a draw handler to a HTMLCanvasElement for every draw which is then passed
 * to the [[ExcaliburGraphicsContext]] implementation as a rendered image.
 *
 * **Low performance API**
 */
export class Canvas extends Raster {
  constructor(private _options: GraphicOptions & CanvasOptions) {
    super(_options);
  }

  public clone(): Canvas {
    return new Canvas({
      ...this._options,
      ...this.cloneGraphicOptions(),
      ...this.cloneRasterOptions()
    });
  }

  execute(ctx: CanvasRenderingContext2D): void {
    this._options.drawHandler(ctx, 0);
    this.flagDirty();
  }
}