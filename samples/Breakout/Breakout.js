function main()
{
  // Create the "engine" object with the main components
  TANK.addComponents("InputManager, CollisionManager, RenderManager, GameLogic");

  // Point the render manager's context to the canvas one
  // Would be nice not to require this somehow?
  TANK.RenderManager.context = document.getElementById("screen").getContext("2d");
  TANK.InputManager.context = document.getElementById("stage");

  // Add background object
  var obj = TANK.createObject().addComponents("Image").attr("Image",
  {
    imagePath: "res/bg_prerendered.png",
    centered: false
  });
  TANK.addObject(obj);

  // Add paddle
  var player = TANK.createObject().addComponents("Image, Paddle, Collider");
  player.Image.imagePath = "res/tiles.png";
  player.Image.subRectOrigin = [0, 64];
  player.Image.subRectCorner = [48, 80];
  player.Image.zdepth = 1;
  player.Collider.width = player.Image.width;
  player.Collider.height = player.Image.height;
  player.Collider.isStatic = true;
  player.Pos2D.x = 160;
  player.Pos2D.y = 376;
  TANK.addObject(player, "Player");

  // Define a ball prefab so it is easy to quickly spawn them
  TANK.addPrefab("Ball",
  {
    "Image":
    {
      imagePath: "res/tiles.png",
      subRectOrigin: [48, 64],
      subRectCorner: [64, 80],
      zdepth: 1
    },
    "Ball":
    {},
    "Collider":
    {
      width: 16,
      height: 16
    },
    "Velocity":
    {}
  });

  // Define a red brick prefab
  TANK.addPrefab("RedBrick",
  {
    "Image":
    {
      imagePath: "res/tiles.png",
      subRectOrigin: [0, 32],
      subRectCorner: [32, 48],
      zdepth: 1
    },
    "Collider":
    {
      width: 32,
      height: 16,
      isStatic: true
    },
    "Brick":
    {}
  });

  // Define a blue brick prefab
  TANK.addPrefab("BlueBrick",
  {
    "Image":
    {
      imagePath: "res/tiles.png",
      subRectOrigin: [0, 0],
      subRectCorner: [32, 16],
      zdepth: 1
    },
    "Collider":
    {
      width: 32,
      height: 16,
      isStatic: true
    },
    "Brick":
    {}
  });

  // Define a green brick prefab
  TANK.addPrefab("GreenBrick",
  {
    "Image":
    {
      imagePath: "res/tiles.png",
      subRectOrigin: [0, 48],
      subRectCorner: [32, 64],
      zdepth: 1
    },
    "Collider":
    {
      width: 32,
      height: 16,
      isStatic: true
    },
    "Brick":
    {}
  });

  // Define an orange brick prefab
  TANK.addPrefab("OrangeBrick",
  {
    "Image":
    {
      imagePath: "res/tiles.png",
      subRectOrigin: [0, 16],
      subRectCorner: [32, 32],
      zdepth: 1
    },
    "Collider":
    {
      width: 32,
      height: 16,
      isStatic: true
    },
    "Brick":
    {}
  });

  // Begin running the engine
  TANK.start();
}

// ### Game logic component
// Manages general state of the game
TANK.registerComponent("GameLogic")

.initialize(function ()
{
  // Keep track of how many balls and bricks exist
  this.numBalls = 0;
  this.numBricks = 0;

  // Keep track of current level
  this.level = -1;

  // Keep track of player lives
  this.lives = 3;

  TANK.addEventListener("OnEnterFrame", this);
  TANK.addEventListener("OnBallAdded", this);
  TANK.addEventListener("OnBallRemoved", this);
  TANK.addEventListener("OnBrickAdded", this);
  TANK.addEventListener("OnBrickRemoved", this);
})

.destruct(function ()
{
  TANK.removeEventListener("OnEnterFrame", this);
  TANK.removeEventListener("OnBallAdded", this);
  TANK.removeEventListener("OnBallRemoved", this);
  TANK.removeEventListener("OnBrickAdded", this);
  TANK.removeEventListener("OnBrickRemoved", this);
})

.addFunction("OnBallAdded", function ()
{
  ++this.numBalls;
})

.addFunction("OnBallRemoved", function ()
{
  --this.numBalls;
})

.addFunction("OnBrickAdded", function ()
{
  ++this.numBricks;
})

.addFunction("OnBrickRemoved", function ()
{
  --this.numBricks;
})

.addFunction("OnEnterFrame", function (dt)
{
  // If no balls exist, spawn a new one and decrement lives
  if (this.numBalls === 0)
  {
    --this.lives;
    if (this.lives === 0)
      TANK.reset();
    else
    {
      // Create a new ball
      var ball = TANK.createObjectFromPrefab("Ball");
      ball.Pos2D.x = 50;
      ball.Pos2D.y = 200;
      TANK.addObject(ball);
      TANK.dispatchEvent("OnLevelStart");
    }
  }

  // If no bricks exist, build the next level
  if (this.numBricks === 0)
  {
    ++this.lives;
    ++this.level;
    TANK.dispatchEvent("OnLevelComplete");

    if (this.level === Breakout.levels.length)
    {}
    else
    {
      var data = Breakout.levels[this.level];
      for (var row in data.bricks)
      {
        for (var col in data.bricks[row])
        {
          var brickType = data.bricks[row][col];
          if (!brickType)
            continue;

          var brick = TANK.createObjectFromPrefab(brickType + "Brick");
          brick.Pos2D.x = 64 + col * brick.Image.width;
          brick.Pos2D.y = 64 + row * brick.Image.height;
          TANK.addObject(brick);
        }
      }
    }
  }
});

// ### Paddle component
// Handles paddle input
// Could be just implemented in the game logic component but I
// wanted to demonstrate using components for smaller tasks
TANK.registerComponent("Paddle")

.initialize(function ()
{
  TANK.addEventListener("OnEnterFrame", this);
  TANK.addEventListener("OnMouseMove", this);
})

.destruct(function ()
{
  TANK.removeEventListener("OnEnterFrame", this);
  TANK.removeEventListener("OnMouseMove", this);
})

.addFunction("OnMouseMove", function (e)
{
  this.parent.Pos2D.x += e.moveX;
})

.addFunction("OnEnterFrame", function (dt)
{
  this.parent.Pos2D.x = TANK.InputManager.mousePos[0];
  if (this.parent.Pos2D.x - 24 < 0)
    this.parent.Pos2D.x = 24
  if (this.parent.Pos2D.x + 24 > 320)
    this.parent.Pos2D.x = 320 - 24;
});

// ### Ball logic
// Handles moving the ball and bouncing off blocks
// Could be just implemented in the game logic component but I
// wanted to demonstrate using components for smaller tasks
TANK.registerComponent("Ball")

.initialize(function ()
{
  // Send out an event that a ball was created
  TANK.dispatchEvent("OnBallAdded", this.parent);

  TANK.addEventListener("OnEnterFrame", this);
  TANK.addEventListener("OnLevelComplete", this);
  TANK.addEventListener("OnLevelStart", this);
})

.destruct(function ()
{
  // Send out an event that a ball was destroyed
  TANK.dispatchEvent("OnBallRemoved", this.parent);

  TANK.removeEventListener("OnEnterFrame", this);
  TANK.removeEventListener("OnLevelComplete", this);
  TANK.removeEventListener("OnLevelStart", this);
})

.addFunction("OnCollide", function (other)
{
  var centerA = [this.parent.Pos2D.x, this.parent.Pos2D.y];
  var centerB = [other.Pos2D.x, other.Pos2D.y];
  var halfSizeA = [this.parent.Collider.width / 2, this.parent.Collider.height / 2];
  var halfSizeB = [other.Collider.width / 2, other.Collider.height / 2];

  // Bounce off player
  if (other.Paddle)
  {
    this.parent.Velocity.x = ((centerA[0] - centerB[0]) / halfSizeB[0]) * 30;
    this.parent.Velocity.y *= -1;
  }

  if (other.Brick)
  {
    var pen = [0, 0];
    if (centerA[0] < centerB[0])
      pen[0] = (centerA[0] + halfSizeA[0]) - (centerB[0] - halfSizeB[0]);
    else
      pen[0] = (centerA[0] - halfSizeA[0]) - (centerB[0] + halfSizeB[0]);

    if (centerA[1] < centerB[1])
      pen[1] = (centerA[1] + halfSizeA[1]) - (centerB[1] - halfSizeB[1]);
    else
      pen[1] = (centerA[1] - halfSizeA[1]) - (centerB[1] + halfSizeB[1]);

    if (Math.abs(pen[0]) < Math.abs(pen[1]))
    {
      this.parent.Velocity.x *= -1;
    }
    else
    {
      this.parent.Velocity.y *= -1;
    }

    other.remove();
  }
})

.addFunction("OnLevelComplete", function ()
{
  this.parent.remove();
})

.addFunction("OnLevelStart", function ()
{
  this.parent.Velocity.x = 30;
  this.parent.Velocity.y = 40;
})

.addFunction("OnEnterFrame", function (dt)
{
  // Collide ball with boundaries
  if (this.parent.Pos2D.x + this.parent.Image.width / 2 > 320 - 16)
  {
    this.parent.Pos2D.x = 320 - 16 - this.parent.Image.width / 2;
    this.parent.Velocity.x *= -1;
  }
  if (this.parent.Pos2D.x - this.parent.Image.width / 2 < 0 + 16)
  {
    this.parent.Pos2D.x = 0 + 16 + this.parent.Image.width / 2;
    this.parent.Velocity.x *= -1;
  }
  if (this.parent.Pos2D.y - this.parent.Image.height / 2 < 0 + 16)
  {
    this.parent.Pos2D.y = 0 + 16 + this.parent.Image.height / 2;
    this.parent.Velocity.y *= -1;
  }

  // Remove ball if it goes off screen
  if (this.parent.Pos2D.y > 416)
  {
    this.parent.remove();
  }
});

// ### Brick component
// Handles brick logic
// Could be just implemented in the game logic component but I
// wanted to demonstrate using components for smaller tasks
TANK.registerComponent("Brick")

.initialize(function ()
{
  TANK.dispatchEvent("OnBrickAdded", this);
})

.destruct(function ()
{
  TANK.dispatchEvent("OnBrickRemoved", this);
})

.addFunction("OnEnterFrame", function (dt) {});