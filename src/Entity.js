// The MIT License (MIT)
//
// Copyright (c) 2013 David Evans
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

(function(TANK)
{
  "use strict";

  var _nextId = 0;

  TANK.Entity = function(name)
  {
    this._name = name;
    this._id = _nextId++;
    this._parent = null;
    this._components = {};
    this._componentsOrdered = [];
    this._children = {};
    this._pendingRemove = [];
    this._initialized = false;
    this._events = {};
  };

  TANK.Entity.prototype.addComponent = function(componentNames)
  {
    if (!Array.isArray(componentNames))
      componentNames = [componentNames];

    for (var i = 0; i < componentNames.length; ++i)
    {
      // Skip this component if we already have it
      var componentName = componentNames[i];
      if (this._components[componentName])
        continue;

      // Get component definition
      var componentDef = TANK._registeredComponents[componentName];
      if (!componentDef)
      {
        console.error("No Component is registered with name: " + componentName + ". Did you include it?");
        continue;
      }

      // Add placeholder component to prevent duplicate adds while parsing
      // dependencies
      this._components[componentName] = "Placeholder";
      this[componentName] = "Placeholder";

      // Add component dependencies
      for (var j = 0; j < componentDef._includes.length; ++j)
      {
        this.addComponent(componentDef._includes[j]);
      }

      // Clone the component
      var c = componentDef.clone();
      this._components[componentName] = c;
      this[componentName] = c;
      this._componentsOrdered.push(c);
      c.construct();
      c._constructed = true;
      c._order = this._componentsOrdered.length - 1;
      c._entity = this;

      // Initialize the component immediately if the entity is already initialized
      if (this._initialized)
      {
        c.initialize();
        var space = this._parent || this;
        space.dispatchEvent("OnComponentAdded", c);
      }
    }

    return this;
  };

  TANK.Entity.prototype.removeComponent = function(componentNames)
  {
    if (!Array.isArray(componentNames))
      componentNames = [componentNames];

    for (var i = 0; i < componentNames.length; ++i)
    {
      // Skip this component if we don't have it
      var componentName = componentNames[i];
      var c = this._components[componentName];
      if (!c)
        continue;

      // Send out remove event
      var space = this._parent || this;
      space.dispatchEvent("OnComponentRemoved", c);

      // Uninitialize the component
      c._uninitializeBase();
      c.uninitialize();

      // Remove from map
      delete this[componentName];
      delete this._components[componentName];
      this._componentsOrdered.splice(c._order, 1);
    }

    return this;
  };

  TANK.Entity.prototype.initialize = function()
  {
    // Initialize every component
    for (var i = 0; i < this._componentsOrdered.length; ++i)
    {
      var c = this._componentsOrdered[i];
      c.initialize();
    }

    this._initialized = true;

    return this;
  };

  TANK.Entity.prototype.uninitialize = function()
  {
    // Uninitialize every component
    for (var i = this._componentsOrdered.length - 1; i >= 0; --i)
    {
      var c = this._componentsOrdered[i];
      c.uninitialize();
    }

    this._initialized = false;

    return this;
  };

  TANK.Entity.prototype.update = function(dt)
  {
    // Remove deleted children
    for (var i = 0; i < this._pendingRemove.length; ++i)
    {
      var id = this._pendingRemove[i]._id;
      var child = this._children[id];
      child.uninitialize();
      child._parent = null;
      delete this._children[id];
    }
    this._pendingRemove = [];

    // Update every component
    for (i = 0; i < this._componentsOrdered.length; ++i)
    {
      if (this._componentsOrdered[i].update)
        this._componentsOrdered[i].update(dt);
    }

    // Update children
    for (i = 0; i < this._children.length; ++i)
    {
      this._children[i].update(dt);
    }

    return this;
  };

  TANK.Entity.prototype.addChild = function(childEntity)
  {
    // Check if entity is already a child of us
    if (childEntity._parent === this)
    {
      console.error("An Entity was added to another Entity twice");
      return this;
    }

    // Initialize the child
    childEntity.initialize();

    // Add entity as a child
    this._children[childEntity._id] = childEntity;
    childEntity._parent = this;

    this.dispatchEvent("OnChildAdded", childEntity);

    return this;
  };

  TANK.Entity.prototype.removeChild = function(childEntity)
  {
    // Check if entity is a child
    if (this._children[childEntity._id])
    {
      this._pendingRemove.push(childEntity);
      this.dispatchEvent("OnChildRemoved", childEntity);
    }
    // Error otherwise
    else
    {
      console.error("The Entity being removed is not a child of the calling Entity");
      return this;
    }

    return this;
  };

  TANK.Entity.prototype.dispatchEvent = function(eventName)
  {
    // Copy arguments and pop off the event name
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);

    // Dispatch the event to listeners
    var listeners = this._events[eventName];
    if (!listeners)
      return this;
    for (var i = 0; i < listeners.length; ++i)
    {
      var evt = listeners[i];
      evt.func.apply(evt.self, args);
    }
  };

  TANK.Entity.prototype.dispatchDeepEvent = function(eventName)
  {
    // Dispatch the event normally
    this.dispatchEvent(eventName);

    // Also tell children to dispatch the event
    for (var i in this._children)
      this._children[i].dispatchDeepEvent(eventName);

    return this;
  };

})(this.TANK = this.TANK || {});