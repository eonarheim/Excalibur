/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A game actor', () => {
	
   var actor: ex.Actor;
   
   var engine;
   var scene;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      actor = new ex.Actor();
      actor.collisionType = ex.CollisionType.Active;
      scene = new ex.Scene(engine);

      spyOn(scene, 'draw').and.callThrough();
      spyOn(actor, 'draw');

      engine = mock.engine(100, 100, scene);
   });

   it('should be loaded', () => {
      expect(ex.Actor).toBeTruthy();
   });

   //it('can have animation', () => {
   //   expect(actor.frames).toEqual({});

   //   actor.addDrawing('first', null);
   //   expect(actor.frames['first']).toBe(null); //TODO
   //});

   it('can change positions when it has velocity', () => {
      expect(actor.pos.y).toBe(0);
      expect(actor.pos.x).toBe(0);

      actor.vel.y = 10;
      actor.vel.x = -10;

      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(-10);
      expect(actor.pos.y).toBe(10);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(-20);
      expect(actor.pos.y).toBe(20);
   });

   it('can have its height and width scaled', () => {
      expect(actor.getWidth()).toBe(0);
      expect(actor.getHeight()).toBe(0);

      actor.setWidth(20);
      actor.setHeight(20);

      expect(actor.getWidth()).toBe(20);
      expect(actor.getHeight()).toBe(20);

      actor.scale.x = 2;
      actor.scale.y = 3;

      expect(actor.getWidth()).toBe(40);
      expect(actor.getHeight()).toBe(60);

      actor.scale.x = .5;
      actor.scale.y = .1;

      expect(actor.getWidth()).toBe(10);
      expect(actor.getHeight()).toBe(2);
   });

   it('can have a center point', () => {
      actor.setHeight(100);
      actor.setWidth(50);

      var center = actor.getCenter();
      expect(center.x).toBe(0);
      expect(center.y).toBe(0);

      actor.pos.x = 100;
      actor.pos.y = 100;

      center = actor.getCenter();
      expect(center.x).toBe(100);
      expect(center.y).toBe(100);

      // changing the anchor
      actor.anchor = new ex.Vector(0, 0);
      actor.pos.x = 0;
      actor.pos.y = 0;

      center = actor.getCenter();
      expect(center.x).toBe(25);
      expect(center.y).toBe(50);

      actor.pos.x = 100;
      actor.pos.y = 100;

      center = actor.getCenter();
      expect(center.x).toBe(125);
      expect(center.y).toBe(150);
   });

   it('has a left, right, top, and bottom', () => {
      actor.pos.x = 0;
      actor.pos.y = 0;
      actor.anchor = new ex.Vector(0.5, 0.5);
      actor.setWidth(100);
      actor.setHeight(100);

      expect(actor.getLeft()).toBe(-50);
      expect(actor.getRight()).toBe(50);
      expect(actor.getTop()).toBe(-50);
      expect(actor.getBottom()).toBe(50);
   });
   
   it('has a left, right, top, and bottom when the anchor is (0, 0)', () => {
      actor.pos.x = 100;
      actor.pos.y = 100;
      actor.anchor = new ex.Vector(0.0, 0.0);
      actor.setWidth(100);
      actor.setHeight(100);

      expect(actor.getLeft()).toBe(100);
      expect(actor.getRight()).toBe(200);
      expect(actor.getTop()).toBe(100);
      expect(actor.getBottom()).toBe(200);
   });

   it('can contain points', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
      actor.setWidth(20);
      actor.setHeight(20);

      expect(actor.anchor.x).toBe(.5);
      expect(actor.anchor.y).toBe(.5);

      actor.anchor = new ex.Vector(0, 0);

      expect(actor.contains(10, 10)).toBe(true);

      expect(actor.contains(21, 20)).toBe(false);
      expect(actor.contains(20, 21)).toBe(false);
		
      expect(actor.contains(0, -1)).toBe(false);
      expect(actor.contains(-1, 0)).toBe(false);
   });

   it('can collide with other actors', () => {
      var actor = new ex.Actor(0, 0, 10, 10);
      var other = new ex.Actor(10, 10, 10, 10);

      // Actors are adjacent and not overlapping should not collide
      expect(actor.collidesWithSide(other)).toBeFalsy();
      expect(other.collidesWithSide(actor)).toBeFalsy();

      // move other actor into collision range from the right side
      other.pos.x = 9;
      other.pos.y = 0;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Right);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Left);

      // move other actor into collision range from the left side
      other.pos.x = -9;
      other.pos.y = 0;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Left);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Right);

      // move other actor into collision range from the top
      other.pos.x = 0;
      other.pos.y = -9;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Top);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Bottom);

      // move other actor into collision range from the bottom
      other.pos.x = 0;
      other.pos.y = 9;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Bottom);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Top);
   });

   it('participates with another in a collision', () => {
      var actor = new ex.Actor(0, 0, 10, 10);
      actor.collisionType = ex.CollisionType.Active;
      var other = new ex.Actor(8, 0, 10, 10);
      other.collisionType = ex.CollisionType.Active;
      var actorCalled = 'false';
      var otherCalled = 'false';

      actor.on('collision', function() {
         actorCalled = 'actor';
      });

      other.on('collision', function() {
         otherCalled = 'other';
      });

      scene.addChild(actor);
      scene.addChild(other);
      scene.update(engine, 20);
      scene.update(engine, 20);

      expect(actorCalled).toBe('actor');
      expect(otherCalled).toBe('other');
   });

   it('can be moved to a location at a speed', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.moveTo(100, 0, 100);
      actor.update(engine, 500);

      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 500);
      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);
   });

   it('can be moved to a location by a certain time', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.moveBy(100, 0,  2000);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(50);
      expect(actor.pos.y).toBe(0);
   });

   it('can be rotated to an angle at a speed via ShortestPath (default)', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rx).toBe(0);
   });

   it('can be rotated to an angle at a speed via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

      actor.update(engine, 1000);
      //rotation is currently incremented by rx delta ,so will be negative while moving counterclockwise
      expect(actor.rotation).toBe(-1 * Math.PI / 2);

      actor.update(engine, 2000);
      expect(actor.rotation).toBe(-3 * Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.rx).toBe(0);
   });

   it('can be rotated to an angle at a speed via Clockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(3 * Math.PI / 2, Math.PI / 2, ex.RotationType.Clockwise);

      actor.update(engine, 2000);
      expect(actor.rotation).toBe(Math.PI);

      actor.update(engine, 1000);
      expect(actor.rotation).toBe(3 * Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(3 * Math.PI / 2);
      expect(actor.rx).toBe(0);
   });

   it('can be rotated to an angle at a speed via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.CounterClockwise);
      actor.update(engine, 2000);
      expect(actor.rotation).toBe(-Math.PI);

      actor.update(engine, 1000);
      expect(actor.rotation).toBe(-3 * Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.rx).toBe(0);

      // rotating back to 0, starting at PI / 2
      actor.rotateTo(0, Math.PI / 2, ex.RotationType.CounterClockwise);
      actor.update(engine, 1000);
      expect(actor.rotation).toBe(0);

      actor.update(engine, 1);
      expect(actor.rx).toBe(0);

   });

   // it('can be rotated to an angle by a certain time', () => {
   // 	expect(actor.rotation).toBe(0);

   // 	actor.rotateBy(Math.PI/2, 2000);
   // 	actor.update(engine, 1000);

   // 	expect(actor.rotation).toBe(Math.PI/4);
   // 	actor.update(engine, 1000);

   // 	expect(actor.rotation).toBe(Math.PI/2);
   //});

   it('can be rotated to an angle by a certain time via ShortestPath (default)', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, 2000);

      actor.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 4);

      actor.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rx).toBe(0);
   });

   it('can be rotated to an angle by a certain time via LongestPath', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, 3000, ex.RotationType.LongestPath);

      actor.update(engine, 1000);
      expect(actor.rotation).toBe(-1 * Math.PI / 2);

      actor.update(engine, 2000);
      expect(actor.rotation).toBe(-3 * Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.rx).toBe(0);
   });

   it('can be rotated to an angle by a certain time via Clockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, 1000, ex.RotationType.Clockwise);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.rx).toBe(0);
   });

   it('can be rotated to an angle by a certain time via CounterClockwise', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, 3000, ex.RotationType.LongestPath);

      actor.update(engine, 1000);
      expect(actor.rotation).toBe(-1 * Math.PI / 2);

      actor.update(engine, 2000);
      expect(actor.rotation).toBe(-3 * Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 2);
      expect(actor.rx).toBe(0);
   });

   it('is rotated along with its parent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (20, 10)

      actor.add(child);
      actor.update(engine, 100);

      expect(child.getWorldX()).toBeCloseTo(10, 0.001);
      expect(child.getWorldY()).toBeCloseTo(20, 0.001);
   });

   it('is rotated along with its grandparent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (20, 10)
      var grandchild = new ex.Actor(10, 0, 10, 10); // (30, 10)

      actor.add(child);
      child.add(grandchild);
      actor.update(engine, 100);

      expect(grandchild.getWorldRotation()).toBe(rotation);
      expect(grandchild.getWorldX()).toBeCloseTo(10, 0.001);
      expect(grandchild.getWorldY()).toBeCloseTo(30, 0.001);
   });

   it('is scaled along with its parent', () => {
      actor.anchor.setTo(0, 0);
      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);

      var child = new ex.Actor(10, 10, 10, 10);

      actor.add(child);
      actor.update(engine, 100);

      expect(child.getWorldX()).toBe(30);
      expect(child.getWorldY()).toBe(30);
   });

   it('is scaled along with its grandparent', () => {
      actor.anchor.setTo(0, 0);
      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);

      var child = new ex.Actor(10, 10, 10, 10);
      var grandchild = new ex.Actor(10, 10, 10, 10);

      actor.add(child);
      child.add(grandchild);
      actor.update(engine, 100);

      // Logic:
      // p = (10, 10)
      // c = (10 * 2 + 10, 10 * 2 + 10) = (30, 30)
      // gc = (10 * 2 + 30, 10 * 2 + 30) = (50, 50)
      expect(grandchild.getWorldX()).toBe(50);
      expect(grandchild.getWorldY()).toBe(50);
   });

   it('is rotated and scaled along with its parent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (30, 10)

      actor.add(child);
      actor.update(engine, 100);

      expect(child.getWorldX()).toBeCloseTo(10, 0.001);
      expect(child.getWorldY()).toBeCloseTo(30, 0.001);
   });

   it('is rotated and scaled along with its grandparent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (30, 10)
      var grandchild = new ex.Actor(10, 0, 10, 10); // (50, 10)

      actor.add(child);
      child.add(grandchild);
      actor.update(engine, 100);

      expect(grandchild.getWorldX()).toBeCloseTo(10, 0.001);
      expect(grandchild.getWorldY()).toBeCloseTo(50, 0.001);
   });  

   it('can be scaled at a speed', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.scaleTo(2, 4, .5, .5);
      actor.update(engine, 1000);

      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
      actor.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2);
      actor.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2.5);
   });

   it('can be scaled by a certain time', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.scaleBy(4, 5, 1000);

      actor.update(engine, 500);
      expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(3);

      actor.update(engine, 500);
      expect(actor.scale.x).toBe(4);
      expect(actor.scale.y).toBe(5);
   });

   it('can blink on and off', () => {
      expect(actor.visible).toBe(true);
      actor.blink(200, 200);

      actor.update(engine, 200);
      expect(actor.visible).toBe(false);

      actor.update(engine, 250);
      expect(actor.visible).toBe(true);
   });

   it('can blink at a frequency forever', () => {
      expect(actor.visible).toBe(true);
      actor.blink(200, 200).repeatForever();
		
      for(var i = 0; i < 2; i++) {
         actor.update(engine, 200);
         expect(actor.visible).toBe(false);

         actor.update(engine, 200);
         expect(actor.visible).toBe(true);

         actor.update(engine, 200);
      }
   });

   it('can be delayed by an amount off time', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.delay(1000).moveTo(20, 0, 20);
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
   });

   it('can die', () => {
      scene.addChild(actor);
      expect(scene.children.length).toBe(1);
      actor.die();
      scene.update(engine, 100);
      expect(scene.children.length).toBe(0);
   });

   it('can perform actions and then die', () => {
      scene.addChild(actor);
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
      expect(scene.children.length).toBe(1);

      actor.moveTo(100, 0, 100).delay(1000).die();
      actor.update(engine, 1000);

      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 500);
      expect(actor.pos.x).toBe(100);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      scene.update(engine, 100);
      expect(scene.children.length).toBe(0);
   });

   it('can repeat previous actions', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1);
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1);
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);
   });

   it('can repeat previous actions forever', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

      for(var i = 0; i < 20; i++) {
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1);
      }
   });

   it('can have its moveTo action stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo(20, 0, 10);
      actor.update(engine, 500);

      actor.clearActions();
      expect(actor.pos.x).toBe(5);
      expect(actor.pos.y).toBe(0);

      // Actor should not move after stop
      actor.update(engine, 500);
      expect(actor.pos.x).toBe(5);
      expect(actor.pos.y).toBe(0);
   });

   it('can have its moveBy action stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy(20, 0, 1000);
      actor.update(engine, 500);

      actor.clearActions();
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      // Actor should not move after stop
      actor.update(engine, 500);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);
   });

   it('can have its rotateTo action stopped', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateTo(Math.PI / 2, Math.PI / 2);

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);

      actor.clearActions();

      actor.update(engine, 500);
      expect(actor.rotation).toBe(Math.PI / 4);
   });

   it('can have its rotateBy action stopped', () => {
      expect(actor.rotation).toBe(0);

      actor.actions.rotateBy(Math.PI / 2, 2000);
		
      actor.update(engine, 1000);
      actor.clearActions();
      expect(actor.rotation).toBe(Math.PI / 4);

      actor.update(engine, 1000);
      expect(actor.rotation).toBe(Math.PI / 4);
   });

   it('can have its scaleTo action stopped', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleTo(2, 2, .5, .5);
      actor.update(engine, 1000);

      actor.clearActions();
      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);

      actor.update(engine, 1000);
      expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
   });

   it('can have its scaleBy action stopped', () => {
      expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

      actor.actions.scaleBy(4, 4, 1000);

      actor.update(engine, 500);

      actor.clearActions();
      expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(2.5);

      actor.update(engine, 500);
      expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(2.5);
   });

   it('can have its blink action stopped', () => {
      expect(actor.visible).toBe(true);
      actor.actions.blink(1, 3000);

      actor.update(engine, 500);
      expect(actor.visible).toBe(false);

      actor.clearActions();
		
      actor.update(engine, 500);
      actor.update(engine, 500);
      expect(actor.visible).toBe(true);
   });

   it('can have its delay action stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.delay(1000).moveTo(20, 0, 20);
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(0);

      actor.clearActions();
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(0);
   });

   it('can have its repeat action stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.clearActions();
      actor.update(engine, 1);
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1);
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(20);
      expect(actor.pos.y).toBe(0);
   });

   it('can have its repeatForever action stopped', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(10);
      expect(actor.pos.y).toBe(0);

      actor.clearActions();

      for(var i = 0; i < 20; i++) {
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);
      }
   });

   it('can follow another actor', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      var actorToFollow = new ex.Actor(10, 0);
      actorToFollow.actions.moveTo(100, 0, 10);
      actor.actions.follow(actorToFollow);
      // actor.update(engine, 1000);
      // expect(actor.pos.x).toBe(actorToFollow.x);

      for(var i = 1; i < 10; i++) {
         // actor.follow(actorToFollow);
         actorToFollow.update(engine, 1000);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(actorToFollow.pos.x - 10);
      }
      //TODO test different follow distances?
   });

   it('can meet another actor' , () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      // testing basic meet
      var actorToMeet = new ex.Actor(10, 0);
      actorToMeet.actions.moveTo(100, 0, 10);
      actor.actions.meet(actorToMeet);

      for(var i = 0; i < 9; i++) {
         actorToMeet.update(engine, 1000);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(actorToMeet.pos.x - 10);
      }

      // actor should have caught up to actorToFollow since it stopped moving
      actorToMeet.update(engine, 1000);
      actor.update(engine, 1000);
      expect(actor.pos.x).toBe (actorToMeet.pos.x);

      //TODO have actor to be followed traveling at a diagonal 'toward' the following actor
      // testing when actorToMeet is moving in a direction towards the following actor
   });

   it('can find its global coordinates if it has a parent', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      var childActor = new ex.Actor(50, 50);
      expect(childActor.pos.x).toBe(50);
      expect(childActor.pos.y).toBe(50);

      actor.add(childActor);

      actor.moveBy(10, 15, 1000);
      actor.update(engine, 1000);

      expect(childActor.getWorldX()).toBe(60);
      expect(childActor.getWorldY()).toBe(65);
   });

   it('can find its global coordinates if it has multiple parents', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      var childActor = new ex.Actor(50, 50);
      var grandChildActor = new ex.Actor(10, 10);

      actor.add(childActor);
      childActor.add(grandChildActor);

      actor.moveBy(10, 15, 1000);
      actor.update(engine, 1000);

      expect(grandChildActor.getWorldX()).toBe(70);
      expect(grandChildActor.getWorldY()).toBe(75);
   });

   it('can find its global coordinates if it doesn\'t have a parent', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.moveBy(10, 15, 1000);
      actor.update(engine, 1000);

      expect(actor.getWorldX()).toBe(10);
      expect(actor.getWorldY()).toBe(15);
   });

   it('can be removed from the scene', () => {
      scene.addChild(actor);
      expect(scene.children.length).toBe(1);
      actor.kill();
      scene.update(engine, 100);
      expect(scene.children.length).toBe(0);
   });

   it('once killed is not drawn', () => {
      scene.add(actor);
      actor.kill();
      scene.update(engine, 100);
      scene.draw(engine.ctx, 100);
      expect(actor.draw).not.toHaveBeenCalled();
   });

   it('does not incure pointer overhead until an event is registered', () => {
      expect(actor.enableCapturePointer).toBeFalsy();
      expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
      actor.on('pointerdown', () => { /*do nothing*/ });
      expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
      expect(actor.enableCapturePointer).toBeTruthy();
      actor.on('pointermove', () => { /*do nothing*/ });
      expect(actor.capturePointer.captureMoveEvents).toBeTruthy();
      expect(actor.enableCapturePointer).toBeTruthy();
   });
	
   it('changes opacity on color', () => {
      actor.color = ex.Color.Black.clone();
      expect(actor.color.a).toBe(1);
      expect(actor.color.r).toBe(0);
      expect(actor.color.g).toBe(0);
      expect(actor.color.b).toBe(0);
		
      expect(actor.opacity).toBe(1.0);
      actor.opacity = .5;
		
      actor.update(engine, 100);
      expect(actor.color.a).toBe(.5);
      expect(actor.color.r).toBe(0);
      expect(actor.color.g).toBe(0);
      expect(actor.color.b).toBe(0);
   });
   
   it('can detect containment off of child actors', () => {
      var parent = new ex.Actor(600, 100, 100, 100);
      var child = new ex.Actor(0, 0, 100, 100);
      var child2 = new ex.Actor(-600, -100, 100, 100);
	  
      parent.add(child);
      child.add(child2);
	  
      // check reality
      expect(parent.contains(550, 50)).toBeTruthy();
      expect(parent.contains(650, 150)).toBeTruthy();

      // in world coordinates this should be false 
      expect(child.contains(50, 50)).toBeFalsy();
	  
      // in world coordinates this should be true
      expect(child.contains(550, 50)).toBeTruthy();
      expect(child.contains(650, 150)).toBeTruthy();
	  
      // second order child shifted to the origin
      expect(child2.contains(-50, -50)).toBeTruthy();
      expect(child2.contains(50, 50)).toBeTruthy();	   
   });
   
   it('can recursively check containment', () => {
      var parent = new ex.Actor(0, 0, 100, 100); 
      var child = new ex.Actor(100, 100, 100, 100);
      var child2 = new ex.Actor(100, 100, 100, 100);
      parent.add(child);
	  
      expect(parent.contains(150, 150)).toBeFalsy();
      expect(child.contains(150, 150)).toBeTruthy();
      expect(parent.contains(150, 150, true)).toBeTruthy();
      expect(parent.contains(200, 200, true)).toBeFalsy();
	  
      child.add(child2);
      expect(parent.contains(250, 250, true)).toBeTruthy();	  
   });

   it('with an active collision type can be placed on a fixed type', () => {
      var scene = new ex.Scene(engine); 
	  
      var active = new ex.Actor(0, -50, 100, 100);
      active.collisionType = ex.CollisionType.Active;
      active.vel.y = 10;
      active.acc.y = 1000;
	  
      var fixed = new ex.Actor(0, 50, 100, 100);
      fixed.collisionType = ex.CollisionType.Fixed;
	  
      scene.add(active);
      scene.add(fixed);
	  
      expect(active.pos.x).toBe(0);
      expect(active.pos.y).toBe(-50);
	  
      expect(fixed.pos.x).toBe(0);
      expect(fixed.pos.y).toBe(50);
	  
      // update many times for safety
      for(var i = 0; i < 40; i++) {
         scene.update(engine, 100);
      }
	 	  
      expect(active.pos.x).toBe(0);
      expect(active.pos.y).toBe(-50);
	  
      expect(fixed.pos.x).toBe(0);
      expect(fixed.pos.y).toBe(50);
   });

   it('updates child actors', () => {
      var parentActor = new ex.Actor();
      var childActor = new ex.Actor();
      scene.add(parentActor);
      parentActor.add(childActor);
      
      spyOn(childActor, 'update');
      
      scene.update(engine, 100);
      
      expect(childActor.update).toHaveBeenCalled();
   });
   
   it('draws visible child actors', () => {
      var parentActor = new ex.Actor();
      var childActor = new ex.Actor();
      scene.add(parentActor);
      parentActor.add(childActor);
      
      spyOn(childActor, 'draw');
      
      childActor.visible = true;
      scene.draw(engine.ctx, 100);
      expect(childActor.draw).toHaveBeenCalled();
   });
   
   it('does not draw invisible child actors', () => {
      var parentActor = new ex.Actor();
      var childActor = new ex.Actor();
      scene.add(parentActor);
      parentActor.add(childActor);
      
      spyOn(childActor, 'draw');
      
      childActor.visible = false;
      scene.draw(engine.ctx, 100);
      expect(childActor.draw).not.toHaveBeenCalled();
   });
   
   it('fires a killed event when killed', () => {
      var actor = new ex.Actor();
      scene.add(actor);
      var killed = false;
      actor.on('kill', (evt: ex.KillEvent) => {
         killed = true;
      });
      actor.kill();
      
      expect(killed).toBe(true);
   });
   
   it('is no longer killed when re-added to the game', () => {
      var actor = new ex.Actor();
      scene.add(actor);
      expect(actor.isKilled()).toBeFalsy();
      actor.kill();
      scene.update(engine, 100);
      expect(actor.isKilled()).toBeTruthy();
      scene.add(actor);
      expect(actor.isKilled()).toBeFalsy();
   });
   
});
