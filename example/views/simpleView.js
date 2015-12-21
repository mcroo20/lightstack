var name = 'equipment';
ls.add_view(name, function(){
    this.model = ls.Models.pattern;
    this.list_container = '#List';
    this.form_container = '#CreateForm';

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

    ls.init_view(name, this, '');

    this.add_listener('#CreateNewBtn', 'click', this.create);
    this.add_listener('.deleteItem', 'click', function(){
        _this.model.delete($(this).parent().attr('data-id'));
    });

    this.list_template(function(item){
        return '<div data-id="' + item.id + '">' + item.name + ' <span class="deleteItem">delete</span></div>';
    });

    var _this = this;
});