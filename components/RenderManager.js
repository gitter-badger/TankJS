TANK.registerComponent("RenderManager")

.initialize(function ()
{
  this.context = null;
  this._drawables = {};
  this._drawablesSorted = [];

  var existing = TANK.getComponentsWithInterface("Drawable");
  for (var i in existing)
    this._drawables[existing[i].name + existing[i].parent.id] = existing[i];
  this.sort();

  TANK.addEventListener("OnEnterFrame", this);
  TANK.addEventListener("OnComponentInitialized", this);
  TANK.addEventListener("OnComponentUninitialized", this);
})

.destruct(function ()
{
  TANK.removeEventListener("OnEnterFrame", this);
  TANK.removeEventListener("OnComponentInitialized", this);
  TANK.removeEventListener("OnComponentUninitialized", this);
})

.addFunction("OnComponentInitialized", function (c)
{
  if (c.interfaces["Drawable"])
  {
    this._drawables[c.name + c.parent.id] = c;
    this.sort();
  }
})

.addFunction("OnComponentUninitialized", function (c)
{
  if (c.interfaces["Drawable"])
  {
    delete this._drawables[c.name + c.parent.id];
    this.sort();
  }
})

.addFunction("OnEnterFrame", function (dt)
{
  for (var i in this._drawablesSorted)
  {
    this._drawablesSorted[i].draw(this.context);
  }
})

.addFunction("sort", function ()
{
  this._drawablesSorted = [];
  for (var i in this._drawables)
    this._drawablesSorted.push(this._drawables[i]);
  this._drawablesSorted.sort(function (a, b)
  {
    return a.zdepth - b.zdepth;
  });
});