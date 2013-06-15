(function (TANK, undefined)
{

  // ### Component object
  // Defines a blueprint for components.
  TANK.Component = function (name)
  {
    this.name = name;
    this._functions = {};
    this._includes = [];
    this._interfaces = [];
  }

  // ### Instantiate a component
  // Creates a component object from this blueprint.
  //
  // - `return`: The new component object.
  TANK.Component.prototype.clone = function ()
  {
    var c = {};

    // Default functions
    c.construct = function () {};
    c.initialize = function () {};
    c.destruct = function () {};

    // Add interfaces
    c.interfaces = {};
    for (var i in this._interfaces)
      c.interfaces[this._interfaces[i]] = true;

    // Add functions
    for (var i in this._functions)
    {
      c[i] = this._functions[i];
    }

    // Set properties
    c.name = this.name;

    return c;
  }

  // ### Require other components
  // Defines a list of components that are required by this one
  // and will be automatically added before this one is added.
  //
  // - `componentNames`: A comma-deliminated string of component names, e.g., "Pos2D, Sprite".
  // - `return`: A reference to itself.
  TANK.Component.prototype.requires = function (componentNames)
  {
    // Get array of component names
    componentNames = componentNames.replace(/\s/g, "");
    this._includes = componentNames.split(",");

    return this;
  }

  // ### Interfaces
  // Defines a list of interfaces that this component implements.
  // Manager components often look for components that implement a particular interface.
  // Common interfaces include `Drawable2D`, and `Collidable`
  //
  // - `interfaces`: A comma-deliminated string of interface names, e.g., "Drawable2D, Collidable".
  // - `return`: A reference to itself.
  TANK.Component.prototype.interfaces = function (interfaces)
  {
    // Get array of interface names
    interfaces = interfaces.replace(/\s/g, "");
    this._interfaces = interfaces.split(",");
    return this;
  }

  // ### Set constructor function
  // Defines a function to be called after the component has been instantiated.
  // This is commonly where you would define member fields with default values.
  //
  // - `func`: A function to call after instantiation.
  // - `return`: A reference to itself.
  TANK.Component.prototype.construct = function (func)
  {
    this._functions.construct = func;
    return this;
  }

  // ### Set init function
  // Defines a function to be called after the component has been constructed and added to an entity.
  //
  // - `func`: A function to call upon initialization.
  // - `return`: A reference to itself.
  TANK.Component.prototype.initialize = function (func)
  {
    this._functions.initialize = func;
    return this;
  }

  // ### Set uninit function
  // Defines a function to be called after the component has been removed from an entity.

  //
  // - `func`: A function to call upon uninitialization.
  // - `return`: A reference to itself.
  TANK.Component.prototype.destruct = function (func)
  {
    this._functions.destruct = func;
    return this;
  }

  // ### Set a custom function
  // Defines a custom-named function to be added to the component.
  //
  // - `func`: A function object.
  // - `return`: A reference to itself.
  TANK.Component.prototype.addFunction = function (name, func)
  {
    this._functions[name] = func;
    return this;
  }

}(this.TANK = this.TANK ||
{}));