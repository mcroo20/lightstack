# Lightstack

Lightstack is a new MVC frontend architecture. It is designed to be quick to learn and impliment and ultra light weight. Many libraries are restrictive to how they can be used but our objective was to create something simple, powerful and extendable.

### Version 0.1

### Architecture
When designing software, architecture is the biggest benifit or problem that you will ultimatly have to deal with. If you use a solid architecture, the complex issues will become easier. In turn, if you use bad architecture, everything will eventually get to a point where it becomes unmanagable. Lightstack is based on the MVC architecture and is designed to help you keep your code in a managable layout and design.

### View
A view is simply designated as a .js file that directly represents a view in the UI. Every popup, and view, should have a cooresponding .js file. This file will handle all logic that the view will perform. From event handlers to writing client side code, the views .js file will handle all interaction that can be performed on a UI screen (or section of screen).

```sh
ls.add_view('equipment', function(){
    // Set the model for the view
    this.model = ls.Models.pattern;
    
    this.list_container = '#List';
    this.form_container = '#CreateForm';
    
    // The base object defines properties but also how to describe a create form
    this.base_object = {
        id: {
            type: 'hidden'
        },
        name: {
            title: 'Name',
            type: 'text',
            required: true,
            read_only: false,
            placeholder: 'name goes here'
        },
        description: {
            title: 'Description',
            type: 'text',
            required: true,
            read_only: false,
            placeholder: 'desc'
        }
    };

    // Initialize the view
    ls.init_view('equipment', this, '');

    // Setup custom listeners in the view. this.create is a base class method
    this.add_listener('#CreateNewBtn', 'click', this.create);
    this.add_listener('.deleteItem', 'click', function(){
        // Remove the item from the model that is tied to the view
        _this.model.delete($(this).parent().attr('data-id'));
    });

    // Set a custom list template for each list item that will be rendered.
    this.list_template(function(item){
        return '<div data-id="' + item.id + '">' + item.name + ' <span class="deleteItem">delete</span></div>';
    });
    
    var _this = this;
});
```
The great part about Lightstack is that everything is customizable and you can adjust any property of the framework to meet the needs of your app. I find that rarly do I create an app that I am able to simply use the same view base functionality. Models are a different story, but for views, you may find yourself writing your own custom version of the view_base.js file or tweaking these files to get everything just right. The view_base.js is meant to get you started and hopefully cover many of the simpler senarios.

### View Base Methods
These are the most common used methods in the view_base.js. You may over ride any method in the class or even simply alter the base class to fit your needs.
* list_template - Accepts a method to be used as the HTML creator for a list item. This method should return an HTML string.
* form_template - Accepts a method to be used as the HTML creator for a form row item. This method should return an HTML string.
* details_template - Accepts a method to be used as the HTML creator for an items detail view. This method should return an HTML string.
* add_listener - Creates an event for a selector like jQuery. (CSS_Selector, action, callback) 
* set_contents - Sets the content of a container and binds all handlers automatically. Can be used in place of $.html()
* base_object - This variable can be used to describe the base object that will be used by the view.

### Models
Models are designed to be the data guardians of an app. Only the model can make changes to the data regardless of storage location. Obstraction is a large part of a models role on an app. They are the gate keepers that keep the data in check and notify views and other models when their data has changed.  

Models are built around an event based architecture that emits events when data in the model is changed. The base model will also try to keep it's data in sync with the storage engine. The below example shows how simple it can be to create a new model that uses localStorage as its storage engine.
```sh
ls.add_model('pattern', function(){
    ls.init_model(this, false, true);
});
```
Since most web apps use a database that resides on a server, the model must get its data from that server and make requests to update the servers database when client changes are made. The below code shows how you might go about doing that through ajax requests. There are four main CRUD handlers that need to be implimented so that the model can request and update your storage engine as needed.
```sh
/**************************************************
 * Cloud Storage Example
 *
 * This example shows how to implement a custom storage engine using
 * an online database and basic ajax requests.
 ***************************************************/

/**
 * Create a new Model using the "add_model" method of the LightStack controller.
 * Initialize the model with a name and create an anonymous function for the model.
 *
 * @param name - You must pass back the data retrieved by storage engine as an array.
 */
ls.add_model('pattern', function(){
    /**
     * Initialize the model.
     *
     * @param model - You must pass in a reference to this class.
     * @param noAutoLoad - If you set the noAutoLoad param to false, the model will not automatically load with data.
     * You will have to load it manually later. To load a model, simply call the 'init()' method.
     * @param offline - If you set offline to true, the model will automatically save data to localStorage.
     * This will be overridden by your handler methods!
     */
    ls.init_model(this);

    /************************************
     Handler Methods
     ------------------------------------
     The handler functions can be best understood as the methods used to go
     retrieve the data from a generic storage engine. This could be through
     localStorage, a local database, an external database or a combination of sources.
     *************************************/
    this.set_handler('create', Create);
    this.set_handler('update', Update);
    this.set_handler('delete', Delete);
    this.set_handler('get_all', GetData);


    /**
     * This method is called to retrieve data on initialization of the object and throughout
     * the life of the model. It will be called to retrieve data from the storage source and
     * keep the memory based Model up to date.
     *
     * @param callback - You must pass back the data retrieved by storage engine as an array.
     */
    function GetData(callback){
        $.get('/pattern/all', callback);
    }

    /**
     * This method is updating the storage system to reflect the changes that have been
     * made to the objects in memory. The call is coming from the Add action.
     *
     * @param obj - The object that needs to be added
     * @param callback - This must be called in order for the base Model to function correctly
     */
    function Create(obj, callback){
        $.post('/pattern/create', obj, function(res){
            callback();
        });
    }

    /**
     * This method is updating the storage system to reflect the changes that have been
     * made to the objects in memory. The call is coming from the Update action.
     *
     * @param obj - The object that needs to be updated
     * @param callback - This must be called in order for the base Model to function correctly
     */
    function Update(obj, callback){
        $.post('/pattern/update', obj, function(res){
            callback();
        });
    }

    /**
     * This method is updating the storage system to reflect the changes that have been
     * made to the objects in memory. The call is coming from the Delete action.
     *
     * @param obj - The object that needs to be updated
     * @param callback - This must be called in order for the base Model to function correctly
     */
    function Delete(obj, callback){
        $.post('/pattern/delete', obj, function(res){
            callback();
        });
    }
});
```

### Model Base Methods
As with the view base class, the model base class exposes various methods that are meant to be used and others that can be overwritten as needed.
* set_data - This method will set the data for the model. Data should be formated as an object with the id being the key for the item. ```{ id: {id: 'id', name: 'test'}, id2: {id: 'id2', name: 'test'}}```
* get - Can be used to return a single item from the model using an ID.
* get_all - Used to return the entire list of objects.
* add - Adds a new item to the model. The new item must have an "id" property
* update - Updates an item within a model. The item must have an "id" property
* delete - Deletes an item from a model using an "id".
* set_handler - Sets a function to be called for ```get, create, update, delete``` calls. These methods control how data is sent or stored outside of the model.
* add_event - Creates a custom event that other views and models can bind to. The default events are ```added, removed, changed, all_changed``` 
* remove_event - Removes an even from the model. Note that if any objects are trying to bind to that event, they will throw an exception.

### Model Events
The base model comes with four defined events:
* added - This event fires whenever a new item is added to the model. The callback will be passed the added object
* removed - This event fires whenever an item is removed from the model. The callback will be passed the removed object
* changed - This event fires whenever an item has been updated or changed. The callback will be passed the changed object
* all_changed - This even fires whenever the models object list is changed. This will be on add, remove, and initialization

You can bind to a models events anywhere following the models <script> declaration. The below code will run any time a models objects are updated.
```sh
    ls.Models.patterns.on(ModelEvents.all_changed, function(objects){
        // Do something with the objects
    });
``` 

### Controller
The last piece of the puzzle is the controller. The controllers job is to tie the view and model together. You can place additional logic in the controller as needed but the logic should be thought to be code used by any view or model. Placing a custom alert or confirm box would be a good example of a method that could exist in the controller.

The main methods of a controller are:
* add_view - Creates a new view in the ls.Views object.
* init_view - Initializes a view. This must be called on any view wanting to the Lightstack base_view object
* add_model - Creates a new model in the ls.Models object
* init_model - Initializes a model. This must be called on any model using the Lightstack base_model object
* show_view - Show a view by name.
* show_view_only - Hides all views except for the named view
* hide_view - Hides the view by name

### More to Come
Lightstack is a brand new project and will change over time to become more powerful and useful. Run the example project(s) under the example folder to try out a simple example.
