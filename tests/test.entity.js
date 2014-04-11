(function()
{
  "use strict";
  var expect = chai.expect;

  describe("TANK.Entity", function()
  {
    TANK.createEngine();
    TANK.main.initialize();
    describe("constructor()", function()
    {
      it("should set the Entity ID to be -1", function()
      {
        var e = new TANK.Entity();
        expect(e._id).to.equal(-1);
      });
    });

    describe("addComponent()", function()
    {
      it("should create a property on the Entity", function()
      {
        TANK.registerComponent("AddComponentTest");
        var e = new TANK.Entity();
        e.addComponent("AddComponentTest");
        expect(e).to.have.property("AddComponentTest");
      });

      it("should work with an array of Component names", function()
      {
        TANK.registerComponent("AddComponentTestB");
        var e = new TANK.Entity();
        e.addComponent(["AddComponentTest", "AddComponentTestB"]);
        expect(e).to.have.property("AddComponentTest");
        expect(e).to.have.property("AddComponentTestB");
      });

      it("should not initialize the Component by default", function()
      {
        var e = new TANK.Entity();
        e.addComponent("AddComponentTest");
        expect(e.AddComponentTest._initialized).to.be.false;
      });

      it("should initialize the Component if the Entity is initialized", function()
      {
        var e = new TANK.Entity();
        TANK.main.addChild(e);
        e.addComponent("AddComponentTest");
        expect(e.AddComponentTest._initialized).to.be.true;
      });
    });

    describe("removeComponent()", function()
    {
      it("should remove the property from the Entity", function()
      {
        var e = new TANK.Entity();
        e.addComponent("AddComponentTest");
        e.removeComponent("AddComponentTest");
        expect(e).to.not.have.property("AddComponentTest");
      });

      it("should work with an array as a parameter", function()
      {
        TANK.registerComponent("AddComponentTestB");
        var e = new TANK.Entity();
        e.addComponent(["AddComponentTest", "AddComponentTestB"]);
        e.removeComponent(["AddComponentTest", "AddComponentTestB"]);
        expect(e).to.not.have.property("AddComponentTest");
        expect(e).to.not.have.property("AddComponentTestB");
      });

      it("should uninitialize the component", function(done)
      {
        TANK.registerComponent("RemoveComponentTest")
        .uninitialize(function()
        {
          done();
        });
        var e = new TANK.Entity();
        e.addComponent("RemoveComponentTest");
        var c = e.RemoveComponentTest;
        e.initialize();
        e.removeComponent("RemoveComponentTest");
        expect(c._initialized).to.be.false;
      });
    });
  });
})();