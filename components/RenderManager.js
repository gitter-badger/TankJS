TankJS.addComponent("RenderManager")

.initFunction(function()
{
  this.context = null;
  this._drawables = {};
  this._drawablesSorted = [];

  var existing = TankJS.getComponentsWithTag("Drawable");
  for (var i in existing)
    this._drawables[existing[i].parent.id] = existing[i];
  this.sort();

  TankJS.addEventListener("OnEnterFrame", this);
  TankJS.addEventListener("OnComponentInitialized", this);
  TankJS.addEventListener("OnComponentUninitialized", this);
})

.uninitFunction(function()
{
  TankJS.removeEventListener("OnEnterFrame", this);
  TankJS.removeEventListener("OnComponentInitialized", this);
  TankJS.removeEventListener("OnComponentUninitialized", this);
})

.addFunction("OnComponentInitialized", function(c)
{
  if (c.tags["Drawable"])
  {
    this._drawables[c.parent.id] = c;
    this.sort();
  }
})

.addFunction("OnComponentUninitialized", function(c)
{
  if (c.tags["Drawable"])
  {
    delete this._drawables[c.parent.id];
    this.sort();
  }
})

.addFunction("OnEnterFrame", function(dt)
{
  for (var i in this._drawablesSorted)
  {
    this._drawablesSorted[i].draw(this.context);
  }
})

.addFunction("sort", function()
{
  this._drawablesSorted = [];
  for (var i in this._drawables)
    this._drawablesSorted.push(this._drawables[i]);
  this._drawablesSorted.sort(function(a, b)
  {
    return a.zDepth - b.zDepth;
  });
});