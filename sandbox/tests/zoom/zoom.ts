﻿/// <reference path='../../excalibur.d.ts' />

var game = new ex.Engine({
   width: 600,
   height: 400,
   canvasElementId: 'game'
});
game.setAntialiasing(false);

var raptorTex = new ex.Texture('raptor.png');
var raptorSheet = new ex.SpriteSheet(raptorTex, 8, 1, 64, 64);
var raptorAnim = raptorSheet.getAnimationForAll(game, 100);
raptorAnim.scale.setTo(2, 2);
raptorAnim.loop = true;


game.isDebug = true;

var target = new ex.Actor(game.canvasWidth / 2, game.canvasHeight / 2, 64*2, 64*2, ex.Color.Red.clone());
target.addDrawing("default", raptorAnim);

var currentZoom = 1.0;

document.addEventListener('mousedown', (ev: MouseEvent) => {
   console.log(game.screenToWorldCoordinates(new ex.Vector(ev.offsetX, ev.offsetY)));
});

target.on('pointerdown',(ev: ex.Input.PointerEvent) => {
  
   target.color = ex.Color.Green.clone();
});

target.on('pointerup',(ev: PointerEvent) => {
   target.color = ex.Color.Red.clone();
});

game.add(target);

game.input.keyboard.on('down', (ev: ex.Input.KeyEvent) => {
   if (ev.key == 107 /* + */) {
      game.currentScene.camera.zoom(currentZoom+=.03);
   }
   if (ev.key == 109 /* - */) {
      game.currentScene.camera.zoom(currentZoom-=.03);
   }

   var currentFocus = game.currentScene.camera.getFocus();
   if (ev.key == ex.Input.Keys.Left) {
      game.currentScene.camera.x = currentFocus.x - 10;
   }
   if (ev.key == ex.Input.Keys.Right) {
      game.currentScene.camera.x = currentFocus.x + 10;
   }
   if (ev.key == ex.Input.Keys.Up) {
      game.currentScene.camera.y = currentFocus.y - 10;
   }
   if (ev.key == ex.Input.Keys.Down) {
      game.currentScene.camera.y = currentFocus.y + 10;
   }

});

var loader = new ex.Loader([raptorTex]);
game.start(loader);