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

