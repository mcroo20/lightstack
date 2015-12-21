function Model(model, noAutoLoad, offline){
    model.Data = null;
    var events = {
        added: [],
        removed: [],
        changed: [],
        all_changed: []
    };
    var handlers = {
        update: function(obj, callback){ if(offline) localStorage['lightstack'] = JSON.stringify(model.Data); callback(); },
        delete: function(obj, callback){ if(offline) localStorage['lightstack'] = JSON.stringify(model.Data); callback(); },
        create: function(obj, callback){ if(offline) localStorage['lightstack'] = JSON.stringify(model.Data); callback(); },
        get_all: function(callback){ if(offline) callback(JSON.parse(localStorage['lightstack'])); else callback(model.Data); },
        get_one: function(obj, callback){ callback(); }
    };

    if(offline && !localStorage['lightstack'])
        localStorage['lightstack'] = '{}';

    if(!noAutoLoad) {
        $(function () {
            model.GetAll();
        });
    }

    this.init = function(){
        model.GetAll();
    };

    this.on = function(event, callback){
        events[event].push(callback);
    };

    this.set_data = function(data){
        model.Data = Copy(data);
        model.fire(ModelEvents.all_changed, data);
    };

    this.get = function(obj_id){
        return Copy(model.Data[obj_id]);
    };

    this.get_all = function(){
        return Copy(model.Data);
    };

    this.add = function(obj){
        if(model.Data[obj.id]){
            model.Data[obj.id] = Copy(obj);
            model.Update(obj);
            model.fire(ModelEvents.changed, obj);
            model.fire(ModelEvents.all_changed, model.Data);
        }
        else {
            if(!obj.id || obj.id == '')
                obj.id = new Date().getTime();
            model.Data[obj.id] = Copy(obj);
            model.Create(obj);
            model.fire(ModelEvents.added, obj);
            model.fire(ModelEvents.all_changed, model.Data);
        }
    };

    this.update = function(obj){
        model.Data[obj.id] = Copy(obj);
        model.Update(obj);
        model.fire(ModelEvents.changed, obj);
        model.fire(ModelEvents.all_changed, model.Data);
    };

    this.delete = function(obj_id){
        delete model.Data[obj_id];
        model.Delete(obj_id);
        model.fire(ModelEvents.removed, obj_id);
        model.fire(ModelEvents.all_changed, model.Data);
    };


    this.fire = function(event, data){
        for(var i in events[event]){
            events[event][i](Copy(data));
        }
    };


    this.set_handler = function(type, callback){
        handlers[type] = callback;
    };

    this.add_event = function(name){
        events[name] = [];
    };

    this.remove_event = function(name){
        delete events[name];
    };

    this.GetAll = function(){
        handlers.get_all(function(data){
            var temp = {};
            for(var i in data){
                temp[data[i].id] = data[i];
            }
            var diff = ArrayDiff(model.Data, temp);
            if(!model.Data || diff.added.length || diff.removed.length) {
                model.set_data(temp);
            }
        });
    };

    this.Update = function(obj){
        handlers.update(obj, function(){
            model.GetAll();
        });
    };

    this.Create = function(obj){
        handlers.create(obj, function(){
            model.GetAll();
        });
    };

    this.Delete = function(obj_id){
        handlers.delete(obj_id, function(){
            model.GetAll();
        });
    };

    function Copy(obj){
        return jQuery.extend(true, {}, obj);
    }

    function ArrayDiff(old, newArray){
        var oldItems = [];
        var newItems = [];
        var same = [];
        for(var i in old){
            for(var r in old[i]){
                if(!newArray[i] || !newArray[i][r]){
                    oldItems.push(old[i]);
                }
            }
        }

        for(var i in newArray){
            for(var r in newArray[i]){
                if(!old || !old[i] || !old[i][r]){
                    newItems.push(newArray[i]);
                }
                else
                    same.push(newItems[i]);
            }
        }
        return { removed: oldItems, added: newItems, same: same };
    }
}

var ModelEvents = {
    added: 'added',
    removed: 'removed',
    changed: 'changed',
    all_changed: 'all_changed'
};