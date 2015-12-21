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