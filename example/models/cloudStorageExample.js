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