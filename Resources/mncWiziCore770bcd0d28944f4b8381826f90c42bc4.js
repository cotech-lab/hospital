AC.Widgets.WiziCore770bcd0d28944f4b8381826f90c42bc4 = (function(c){
  var w =  AC.Widgets.Base.extend({
        _widgetClass : c,
        _dataPropName : "data",
        _containerDiv: null,
        _isBuild : false,
        _scripts : null,
        _frameDrawn: false,

        _template : "<script type=\"text/javascript\" src=\"//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js\"></script><script type=\"text/javascript\" src=\"wiziCore/widgetframe.js\"></script> <style>body{margin:0px;padding: 0px;}</style><object width=\"100%\"  height=\"100%\">\
<param name=\"movie\" value=\"http://www.youtube.com/v/[*VideoID*]?fs=1&amp;hl=en_US\"></param>\
<param name=\"wmode\" value=\"opaque\" /><param name=\"allowFullScreen\" value=\"true\"></param><param name=\"allowscriptaccess\" value=\"always\"></param><embed src=\"http://www.youtube.com/v/[*VideoID*]?fs=1&amp;hl=en_US\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"true\" width=\"100%\" wmode=\"opaque\" height=\"100%\"></embed></object>",

        init: function() {
            this._super.apply(this, arguments);
            this._scripts = [

            ];
        },
        initProps: function() {
            this._super();
            this.aspectResize = this.htmlProperty('aspectResize', this._updateLayout);
        },
        replaceAll : function(source, stringToFind, stringToReplace) {
            var temp = source;
            var index = temp.indexOf(stringToFind);
            while (index != -1) {
                temp = temp.replace(stringToFind, stringToReplace);
                index = temp.indexOf(stringToFind);
            }
            return temp;
        },

        _updateLayout: function() {
            this._super();
            if (this._cDiv != null) {
                $(this._cDiv).width("100%").height(this.height());
                if (this._frameDrawn){
                    clearInterval(this._drawInterval);
                    var self = this;
                    this._drawInterval = setInterval(function(){
                        clearInterval(self._drawInterval);
                        self.drawFrame();
                    }, 20);
                }
            }
            this.checkResize();
        },

        draw : function() {
            this._cDiv = $("<iframe>");
            this._cDiv[0].setAttribute("frameBorder", 0);
            this._cDiv[0].setAttribute("scrolling", "auto");
            this._cDiv[0].setAttribute("hspace", 0);
            this._cDiv[0].setAttribute("vspace", 0);
            this._cDiv.css({"width": "100%", "height": this.height(), "border" : "none"});
            this.base().prepend(this._cDiv);
            var self = this;
            this.tableBase().resize(function(){
                self._cDiv.css({"height": self.tableBase().height() - 5});
            });
            this._super.apply(this, arguments);
        },

        onPageDrawn: function() {
            var self = this;
            this._super.apply(this, arguments);
            this._cDiv.load(function() {
                self.drawFrame();
            });
            this._cDiv.attr('src', 'widgetframe.html');
            this._super.apply(this, arguments);
        },

        initDomState: function() {
            this._super();
            this.initDomStatePos();
            this._visible(this.visible());
        },

        _refreshObj: function() {
            this.drawFrame();
        },

        drawFrame : function() {
            var template = this._template;
            var pGroups = AC.Widgets[this._widgetClass].props();
            for (var i = 0, l = pGroups.length; i < l; i ++) {
                for (var j = 0, lj = pGroups[i].props.length; j < lj; j ++) {
                    var propName = pGroups[i].props[j].name;
                    var value = this.prop(propName);
                    value = (value == undefined) ? '' : value;
                    template = this.replaceAll(template, '[*' + propName + '*]', value);
                }
            }
            if (this._cDiv[0].contentWindow != null && this._cDiv[0].contentWindow.setScripts != undefined){
                this._cDiv[0].contentWindow.setScripts(this._scripts);
                this._cDiv[0].contentWindow.putContent(template);
                this._frameDrawn = true;
            }
        }

        ,VideoID:function(){return this.htmlProperty('VideoID', this._refreshObj).apply(this, arguments);}

    });


w.props = function(){
    var ret = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name
        ]},

        { name: AC.Property.group_names.layout, props:[
            AC.Property.layout.aspectResize,
            AC.Property.layout.pWidth,
            AC.Property.layout.width,
            AC.Property.layout.height,
            AC.Property.layout.x,
            AC.Property.layout.y,
            AC.Property.layout.tabindex,
            AC.Property.layout.zindex,
            AC.Property.layout.anchors
        ]},

        { name: AC.Property.group_names.layout, props:[
            AC.Property.behavior.visible
        ]},

        { name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.margin,
            AC.Property.style.widgetStyle
        ]}

    ];

    w._addProperties(ret, [['VideoID','YouTube','text','false','VideoID','VideoID']]);
    return ret;
};

w._addProperties = function(list, props) {
    for (var i = 0, l = props.length; i < l; i++ ) {
        w._addProperty(list, props[i][0], props[i][1], props[i][2], props[i][3], props[i][4], props[i][5]);
    }
};

w._addProperty = function(props, name, group, type, inTheme, accessor, alias) {
    var isGroupExist = false;
    var propObj = {name: name, type : type, get: accessor, set: accessor, alias: alias, inTheme: inTheme};
    for (var i = 0, l = props.length; i < l; ++i) {
        if (props[i].name == group) {
            props[i].props.push(propObj);
            isGroupExist = true;
            break;
        }
    }
    if (!isGroupExist) {
        props.push({name: group, props: [propObj]});
    }
};

w.emptyProps = function(){
    return {};
};

/**
 * Return widget inline edit prop name
 * @return {String} default properties
 */
w.inlineEditPropName = function(){
    return null;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
w.defaultProps = function(){
    return {VideoID:'sfBxbLb62-Q',width: 200,height:200, x : "100", y: "100", zindex : "auto",
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
        opacity : 1, name: "YouTube", margin : ""
    };
};

w.emptyProps = function(){
    return {};
};



/**
 * Return widget data model
 * @return {Object} default properties
 */
w.widgetDataModel = function(){
    return [];
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
w.actions = function(){
    var ret = {};
    // append base actions
    ret = jQuery.extend(WiziCore_UI_BaseWidget.actions(), ret);
    return ret;
};


/* Lang constants */
/**
 * Return available widget langs
 * @return {Object} available actions
 */
w.langs = function(){
    return { "en" : {} };
};

/* Register widget in the Designer */
AC.Core.Widgets().registerExWidget(c, "widget_cat_common", "YouTube", "YouTube",
    "wiziCore/extWidgets/widget-cog.png");
return w;

})("WiziCore770bcd0d28944f4b8381826f90c42bc4");
