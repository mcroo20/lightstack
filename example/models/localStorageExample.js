/**************************************************
 * Local Storage Example
 *
 * This example shows how to implement a custom storage engine using
 * localStorage. It is somewhat worthless as the base model will
 * automatically implement this functionality if you set 'offline'
 * to 'true' in the ls.init_model() call.
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

    if(!localStorage['patterns'])
        localStorage['patterns'] = JSON.stringify({1: { id: 1, name: 'Test Pattern', pattern: '' }});

    /************************************
                Handler Methods
     ------------------------------------
     The handler functions can be best understood as the methods used to go
     retrieve the data from a generic storage engine. This could be through
     localStorage, a local database, an external database or a combination of sources.
     *************************************/
    this.set_handler('create', Add);
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
        callback(JSON.parse(localStorage['patterns']));
    }

    /**
     * This method is updating the storage system to reflect the changes that have been
     * made to the objects in memory. The call is coming from the Add action.
     *
     * @param obj - The object that needs to be added
     * @param callback - This must be called in order for the base Model to function correctly
     */
    function Add(obj, callback){
        localStorage['patterns'] = JSON.stringify(_this.Data);
        callback();
    }

    /**
     * This method is updating the storage system to reflect the changes that have been
     * made to the objects in memory. The call is coming from the Update action.
     *
     * @param obj - The object that needs to be updated
     * @param callback - This must be called in order for the base Model to function correctly
     */
    function Update(obj, callback){
        localStorage['patterns'] = JSON.stringify(_this.Data);
        callback();
    }

    /**
     * This method is updating the storage system to reflect the changes that have been
     * made to the objects in memory. The call is coming from the Delete action.
     *
     * @param obj - The object that needs to be updated
     * @param callback - This must be called in order for the base Model to function correctly
     */
    function Delete(obj, callback){
        localStorage['patterns'] = JSON.stringify(_this.Data);
        callback();
    }
});