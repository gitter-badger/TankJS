TankJS.addComponent("Text")

.tags("Drawable")

.includes("2D")

.initFunction(function()
{
  this.zdepth = 0;
  this.color = "#000";
  this.text = "";
  this.offsetX = 0;
  this.offsetY = 0;
})

.addFunction("draw", function(ctx)
{
  var t = this.parent.getComponent("2D");
  ctx.fillStyle = this.color;
  ctx.lineWidth = 0;
  ctx.fillText(this.text, t.x + this.offsetX, t.y + this.offsetY);
});