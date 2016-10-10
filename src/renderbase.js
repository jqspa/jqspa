spa.RenderBase = ( function(){
    var RenderBase = {};
    RenderBase.errorTemplates = {};

    RenderBase.create = function(config){
    	return $.extend(
            Object.create(RenderBase), 
            {
                context: {},
                template: '',
                cssRules: ''
            }, 
            config || {}
        );
    };

	RenderBase.__setUp = function($element){
		this.$container = $element;
		this.$container.addClass(this.name);
		this.init();
	};

	RenderBase.__parse_style = function(){
		var sheet = jQuery('<style class="' + this.name + '-style">')
		sheet.append(this.cssRules || "");
        this.sheet = spa.$cache.$styleSheets.push(sheet);
	};

    RenderBase.__cleanUp = function(){
        spa.$cache.$styleSheets.unload(this.$container.attr('class') + '-style');
    };

	RenderBase.init = function(){
		// BAD?
		this.renderTemplate();
	};

	RenderBase.renderTemplate = function(context, partials){
        if (!this.sheet) this.__parse_style();
		this.$container.html( Mustache.render(
			this.template,
			jQuery.extend({}, this.context, context || {}),
            jQuery.extend({}, this.templateMap, partials || {}) 
		));
		this.components = this.$find(this.$container);
	};

    RenderBase.$find = function($element, dontRender){
        var components = [];
        $element.find('[data-component-name]').each(function(index, element){
        	var component;
            var $element = jQuery(element);
            var componentName = $element.data('component-name');
            var bluePrint = spa.components[componentName];
            
            //set error component if none is found
            if(!bluePrint){
                component = spa.Component.errorTemplates['404'].create({
                	context: {
                		name: componentName
                	}
                });

            } else if ($element.parents('[data-component-name="' + componentName + '"]').length){
                component = spa.Component.errorTemplates['500'].create({
                	context: {
                		name: componentName
                	}
                });
            } else{
            	component = bluePrint();
            }
            
	        components.push(component);

    	    component.__setUp($element);
        });

        return components;
    };

    RenderBase.$insert = function($element, config){
    	// var $element = jQuery(element);
    	var component;
        var componentName = $element.data('component-name');
        var bluePrint = spa.components[componentName];
        
        //set error component if none is found
        if(!bluePrint){
            component = spa.Component.errorTemplates['404'].create({
            	context: {
            		name: componentName
            	}
            });

        } else if ($element.parents('[data-component-name="' + componentName + '"]').length){
            component = spa.Component.errorTemplates['500'].create({
            	context: {
            		name: componentName
            	}
            });
        } else{
        	component = bluePrint(config || {});
        }

        this.components.push(component);

	    component.__setUp($element);
        return component
    };

	return Object.create(RenderBase);
} )();
