﻿import { Engine } from './Engine';
import { ColorBlindCorrector, ColorBlindness } from './PostProcessing';

export interface DebugFlags {
  colorBlindMode: ColorBlindFlags;
}

export class ColorBlindFlags {
  private _engine: Engine;

  constructor(engine: Engine) {
    this._engine = engine;
  }

  public correct(colorBlindness: ColorBlindness) {
    this._engine.postProcessors.push(new ColorBlindCorrector(this.engine, false, colorBlindness));
  }

  public simulate(colorBlindness: ColorBlindness) {
    this._engine.postProcessors.push(new ColorBlindCorrector(this.engine, true, colorBlindness));
  }
}
