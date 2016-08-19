/// <reference path='../../../../dist/excalibur.d.ts' />

var game = new ex.Engine({
   width: 600,
   height: 400
});

game.isDebug = true;

ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
ex.Physics.acc.setTo(0, 100);

function spawnBlock(x: number, y: number){
   var block = new ex.Actor(x, y, 20, 20, ex.Color.Azure.clone());
   block.collisionType = ex.CollisionType.Active;
   game.add(block);
}

function spawnCircle(x: number, y: number){
   var circle = new ex.Actor(x, y, 20, 20, ex.Color.Azure.clone());
   circle.collisionArea = new ex.CircleArea({
      body: circle.body,
      radius: 20,
      pos: ex.Vector.Zero.clone()
   });
   circle.moi = circle.collisionArea.getMomentOfInertia()
   circle.collisionType = ex.CollisionType.Active;
   game.add(circle);
}

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Black.clone());
ground.collisionType = ex.CollisionType.Fixed;
game.add(ground);

var circle = new ex.Actor(300, 380, 20, 20, ex.Color.Azure.clone());
circle.collisionArea = new ex.CircleArea({
   body: circle.body,
   radius: 20,
   pos: ex.Vector.Zero.clone()
});
circle.moi = circle.collisionArea.getMomentOfInertia()
circle.collisionType = ex.CollisionType.Fixed;
//game.add(circle);


spawnBlock(300, 0);

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
   if(evt.key === ex.Input.Keys.B){
      spawnBlock(300, 0);
   }

   if(evt.key === ex.Input.Keys.C){
      spawnCircle(300, 0);
   }

});

game.start();