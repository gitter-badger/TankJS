function main()
{
  // Create the "engine" object with the main components
  var e = TankJS.addObject("Engine").addComponents("InputManager, Canvas, CollisionManager, RenderManager, GameLogic");

  // Point the render manager's context to the canvas one
  // Would be nice not to require this somehow?
  e.RenderManager.context = e.Canvas.context;

  // Add background object
  TankJS.addObject().addComponents("Image").attr("Image", {imagePath: "res/bg_prerendered.png", centered: false});

  // Add paddle
  var player = TankJS.addObject("Player").addComponents("Image, Paddle");
  player.Image.imagePath = "res/tiles.png";
  player.Image.subRectOrigin = [0, 64];
  player.Image.subRectCorner = [48, 80];
  player.Image.zdepth = 10;
  player.Pos2D.x = 160;
  player.Pos2D.y = 300;

  // Begin running the engine
  TankJS.start();
}

// Custom game logic component to manage general state of game
TankJS.addComponent("GameLogic")

.initFunction(function()
{
  TankJS.addEventListener("OnEnterFrame", this);
})

.uninitFunction(function()
{
  TankJS.removeEventListener("OnEnterFrame", this);
})

.addFunction("OnEnterFrame", function(dt)
{
});

// Custom game logic component to manage general state of game
TankJS.addComponent("Paddle")

.initFunction(function()
{
  TankJS.addEventListener("OnEnterFrame", this);
})

.uninitFunction(function()
{
  TankJS.removeEventListener("OnEnterFrame", this);
})

.addFunction("OnEnterFrame", function(dt)
{
});