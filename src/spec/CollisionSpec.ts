/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('A Collision', () => {
   var actor1: ex.Actor = null;
   var actor2: ex.Actor = null;
   var scene: ex.Scene = null;
   var engine: ex.Engine = null;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      engine = mock.engine(0, 0);
      scene = new ex.Scene(engine);
      engine.currentScene = scene;
      actor1 = new ex.Actor(0, 0, 10, 10);
      actor2 = new ex.Actor(5, 5, 10, 10);
      actor1.collisionType = ex.CollisionType.Active;
      actor2.collisionType = ex.CollisionType.Active;
      scene.add(actor1);
      scene.add(actor2);
   });

   it('should throw one event for each actor participating', () => {
      var numCollisions = 0;
      actor1.on('collision', (e: ex.CollisionEvent) => {
         e.other.kill();
         numCollisions++;
      });

      actor2.on('collision', (e: ex.CollisionEvent) => {         
         numCollisions++;
      });
      scene.update(engine, 20);
      scene.update(engine, 20);
      scene.update(engine, 20);
      scene.update(engine, 20);
      expect(numCollisions).toBe(2);
   });
   
   it('should recognize when actor bodies are touching', () => {
     var touching = false;
     actor1.on('update', function() {
       if (actor1.body.touching(actor2)) {
         touching = true;
       }
     });
     
     scene.update(engine, 20);
     expect(touching).toBe(true);
   });
   
   it('should recognize when bodies were touching last frame', (done) => {
     var wasTouching = 0;
     var engine1 = TestUtils.engine({width: 200, height: 200});
     
     var actor3 = new ex.Actor(0, 0, 10, 10);
     var actor4 = new ex.Actor(30, 0, 10, 10);
     
     engine1.start().then(() => {
       actor3.vel.setTo(200, 0);
       actor3.collisionType = ex.CollisionType.Active;
       actor4.collisionType = ex.CollisionType.Active;
       engine1.add(actor3);
       engine1.add(actor4);
       
       actor3.on('update', function() {
        
         if (actor3.body.wasTouching(actor4, engine1)) {
           wasTouching++;
           expect(wasTouching).toBe(1);
           done();
           engine1.stop();
           
         }
         
       });
       
     });
  
  
     
   });
   


});