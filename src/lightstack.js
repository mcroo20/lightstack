var ls = new LightStack();
function LightStack(){
    this.Views = {};
    this.Models = {};

    this.add_view = function(name, implementation){
        ls.Views[name] = new implementation();
    };

    this.init_view = function(name, view, create_path){
        view.__proto__ = new View(name, view, create_path);
        view.model.on(ModelEvents.all_changed, view.show_all);
    };

    this.add_model = function(name, implementation){
        ls.Models[name] = new implementation();
    };

    this.init_model = function(model, noAutoFill, offline){
        model.__proto__ = new Model(model, noAutoFill, offline);
    };

    this.show_view = function(name){
        ls.Views[name].show();
    };

    this.show_view_only = function(name){
        for(var i in ls.Views){
            if(i != name)
                ls.Views[i].hide();
            else
                ls.Views[i].show();
        }
    };

    this.hide_view = function(name){
        ls.Views[name].hide();
    };
}


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


function View(name, view, detailsPath){
    var listener = {};
    view.selected_id;
    view.base_object;
    view.list_container = view.list_container || '#' + name + '-list';
    view.form_container = view.form_container || '#' + name + '-form';
    view.details_container = view.details_container || '#' + name + '-details';
    //$$(document).on('pageInit', '.page[data-page="' + name + '-list"]', function (e) {
    //    view.show_all();
    //});
    //$$(document).on('pageInit', '.page[data-page="' + name + '-details"]', function (e) {
    //    if(view.selected_id)
    //        view.load(view.selected_id);
    //});

    var handlers = {
        list_draw: function(item){
            return "<li>" +
                        "<a href='" + detailsPath + " #id=" + item.id + "' class='item-link item-content' data-id='" + item.id + "'>" +
                        "<div class='item-inner'>" +
                        "<div class='item-title'><span class='location'><i class='fa fa-crosshairs'></i>" + "</span> " + (item.name) + " <span class='deleteItem'>delete</span></div>" +
                        "</div>" +
                        "</a>" +
                    "</li>";
        },
        form_draw: function(key, value){
            return '<div>' + (value.type != 'hidden' ? (value.title || key) : '') + '</div>' +
                        '<div><input class="' + (value.required ? 'required' : '') + '" ' + (value.read_only ? 'readonly' : '') + ' type="' + (value.type || 'text') + '" name="' + name + '_' + key + '" placeholder="' + (value.placeholder || '') + '">' +
                    '</div>';
        },
        details_draw: function(){}
    };

    this.list_template = function(method){
        handlers.list_draw = method;
    };

    this.form_template = function(method){
        handlers.form_draw = method;
    };

    this.details_template = function(method){
        handlers.details_draw = method;
    };

    this.add_listener = function(selector, action, callback){
        listener[selector+action] = {
            selector: selector,
            action: action,
            callback: callback
        };
    };

    this.set_contents = function(selector, html, type){
        if(type == 'append')
            $(selector).append(html);
        else if(type == 'prepend')
            $(selector).prepend(html);
        else
            $(selector).html(html);

        view.bind_handlers();
    };

    this.bind_handlers = function (){
        $('#' + name + '-list li a').off('click').click(function(){
            view.selected_id = $(this).attr('data-id');
        });
        $('#create-' + name).off('click').click(function(){
            view.create();
        });

        if(view.form_container) {
            $(view.form_container).parent().find('.saveBtn').off('click').click(function () {
                view.save();
                view.clear_form();
                view.close_create_form();
            });
            $(view.form_container).parent().find('.saveAndNewBtn').off('click').click(function () {
                view.save();
                view.clear_form();
            });
            $(view.form_container).parent().find('input').off('keyup').keyup(function (e) {
                if(e.keyCode == 13) {
                    view.save();
                    view.clear_form();
                    view.close_create_form();
                }
            });
        }

        for(var i in listener){
            $(listener[i].selector).off(listener[i].action).on(listener[i].action, listener[i].callback);
        }
    };

    this.load = function(id){
        var item = view.model.get_one(id, function(){

        });
    };

    this.create = function(){
        if(view.base_object) {
            var html = '';
            for (var i in view.base_object) {
                html += handlers.form_draw(i, view.base_object[i]);
            }
            view.set_contents(view.form_container, html);
        }
        else{
            console.error('Error: Please define a base_object for this view.');
        }
    };

    this.populate_pickers = function(){
        if(Views[name].populate_pickers)
            Views[name].populate_pickers();
    };

    this.clear_form = function(){
        $(view.form_container).find('input').each(function (index) {
            $(this).val('');
        });
    };

    this.close_create_form = function(){

    };

    this.save = function(){
        var obj = {};
        $(view.form_container).find('input').each(function (index) {
            var key = $(this).attr("name").replace(name+'_', '');
            obj[key] = $(this).val() || ($(this).attr('type') == 'checkbox' ? ($(this).attr('checked') == "checked" ? true : false): '');
        });
        view.model.add(obj);
    };

    this.show_all = function(list){
        var html = '';
        for (var i in list) {
            html += handlers.list_draw(list[i]);
            if(!view.base_object)
                view.base_object = list[i];
        }
        view.set_contents(view.list_container, html);
    };
}

var Views = {};

