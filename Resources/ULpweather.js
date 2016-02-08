/**
 * @lends       WiziCore_UI_WeatherWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_WeatherWidget = AC.Widgets.WiziCore_UI_WeatherWidget = AC.Widgets.Base.extend({
    _widgetClass : "WiziCore_UI_WeatherWidget", //widget Class name
    _dataPropName : "zipCode", //the method name, which is responsible for working with data
    _weatherDiv: null,//jQuery object
    _wBtn : null,

    _run: null,

    /**
     * Description of constructor
     * @class  Some words about label widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        this._input = $('<input type="text" class="input clear-input-border" style="width:100%; height:100%"/>');
        var div = $("<div>");
        div.css({position: "relative", width: "100%", height:"100%"});
        this._weatherDiv = div;
        this._wBtn = $("<input type='button' class='input' style='height:100%'>")
                .css({
                         "position": "absolute",
                         "right": "0px",
                         "cursor": "pointer",
                         "top": "0px",
                         "background-color": "#f7f7f7",
                         "border": "1px solid gray"
                     });

        div.append(this._input);
        div.append(this._wBtn);
        this.base().prepend(div);

        var self = this;
        $(self._input).bind("change.custom", {self : self}, self.onChangeText);
        $(self._input).bind("keydown.custom", {self : self}, self.onKeyDown);
        $(self._wBtn).bind("click.custom", {self: self}, self.onWBtnClick);
        /*
         var text = initialObject.prop(this._dataPropName);
         if (text != undefined){
         initialObject.value( text );
         }
         */
        this._super.apply(this, arguments);
    },


    initProps: function() {
        this._super();

        this.font = this.themeProperty('font', this._font);
        this.border = this.themeProperty('border', this._border);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.bg = this.themeProperty('bgColor', this._bg);

        this.btnText = this.htmlProperty('btnText', this._btnText);
        this.opacity = this.htmlProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);

        this.showBtn = this.htmlProperty('showBtn', this._showBtn);
        this.gridField = this.normalProperty('gridField');
        this.failText = this.normalProperty('failText');
        this.zipCode = this.htmlProperty('zipCode', this._zipCode);
    },

    initDomState : function () {
        this._super();
        this.initDomStatePos();
        this._bg(this.bg());
        this._font(this.font());
        this._fontColor(this.fontColor());
        this._border(this.border());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());

        this._btnText(this.btnText());
        this._showBtn(this.showBtn());
        this._zipCode(this.zipCode());
    },

    destroy: function() {
        $(this._input).unbind("keydown.custom");
        $(this._input).unbind("change.custom");
        $(this._wBtn).unbind("click.custom");
        this._super();
    },

    setFocus: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.focus();
        }
    },

    onWBtnClick: function(ev) {
        if (ev != undefined) {
            var self = ev.data.self;
        } else {
            self = this;
        }
        var form = self.form();
        var weatherClient = form.weatherClient;

        var fail = form.find(self.failField());
        var city = form.find(self.cityField());
        var state = form.find(self.stateField());
        var grid = null;
        var zip = self.zipCode();
        var colModel = null;
        var gridField = self.gridField();
        if (typeof gridField == "object" && gridField != null) {
            if (gridField.gridUid != undefined) {
                grid = form.find(gridField.gridUid);
            }

            if (gridField.colValue != undefined) {
                colModel = gridField.colValue;
            }
        }
        weatherClient.WeatherForecast(zip, fail, function(result, error) {
            if (error === true) {
                self.onError(result);
            } else {
                if (result.Success == "false") {
                    self.onFail(result);
                } else {
                    self.onSuccess(result);
                }
            }
        }, state, city, grid, colModel);
        self.setGMapPosition();
    },

    setGMapPosition: function() {
        if (this.gMap() != null) {
            //call googleMap widget
            var form = this.object().form();
            var gMap = form.find(this.gMap());
            if (gMap != null) {
                var webClient = form.context().webClient();
                webClient.httpRequest("http://maps.google.com/maps/api/geocode/json",
                        "GET", function(data, error) {
                    if (error === false && data.results[0] !== undefined) {
                        gMap.prop("longitude", data.results[0].geometry.location.lng);
                        gMap.prop("latitude", data.results[0].geometry.location.lat);
                    }
                }, {address: this.zipCode(), sensor:"false"}, "json");
            }
        }
    },

    onSuccess: function(json) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_WeatherWidget.onSuccess);
        $(this.object()).trigger(triggerEvent, [json]);
        return !triggerEvent.isPropagationStopped();
    },

    onFail: function(result) {
        WiziCore_Helper.showWarning("", result.ResponseText);
        var triggerEvent = new jQuery.Event(WiziCore_UI_WeatherWidget.onFail);
        $(this.object()).trigger(triggerEvent, [result]);
        return !triggerEvent.isPropagationStopped();
    },

    onError: function(result) {
        WiziCore_Helper.showError(AC.Core.lang().tr("widget_ext_weather_error"), this.failText(), 1332);
        var triggerEvent = new jQuery.Event(WiziCore_UI_WeatherWidget.onError);
        $(this.object()).trigger(triggerEvent, [result]);
        return !triggerEvent.isPropagationStopped();
    },

    onChangeText: function(ev) {
        var self = ev.data.self;
        self.zipCode($(self._input).val());
    },

    onKeyDown: function(ev) {
        var self = ev.data.self;
        if (ev.keyCode == 13) {
            self.zipCode($(self._input).val());
            self.onWBtnClick();
        }
    },

    _enable: function(flag){
        this._super(flag, this._input);
        this._super(flag, this._wBtn);
        (flag === false) ? this._input.addClass('ui-state-disabled') : this._input.removeClass('ui-state-disabled');
        (flag === false) ? this._wBtn.addClass('ui-state-disabled') : this._wBtn.removeClass('ui-state-disabled');
    },

    _zipCode: function(text) {
        this.base().find("input:eq(0):text").attr("value", text);
    },

    failField: function(val) {
        if (val != undefined) {
            this._project['failField'] = this.getUidWidgetFromObjectChooser(val);
            var obj = {"failField": this._project['failField']};
            this.sendExecutor(obj);
        }
        return this._project['failField'];
    },

    _showBtn: function(val) {
        if (val != undefined) {
            if (val == true) {
                $(this._wBtn).show();
            } else {
                $(this._wBtn).hide();
            }
        }
    },

    gMap: function(val) {
        if (val != undefined) {
            this._project['gMap'] = this.getUidWidgetFromObjectChooser(val);
            var obj = {"gMap": this._project['gMap']};
            this.sendExecutor(obj);
        }
        return this._project['gMap'];
    },

    cityField: function(val) {
        if (val != undefined) {
            this._project['cityField'] = this.getUidWidgetFromObjectChooser(val);
            var obj = {"cityField": this._project['cityField']};
            this.sendExecutor(obj);
        }
        return this._project['cityField'];
    },

    stateField: function(val) {
        if (val != undefined) {
            this._project['stateField'] = this.getUidWidgetFromObjectChooser(val);
            var obj = {"stateField": this._project['stateField']};
            this.sendExecutor(obj);
        }
        return this._project['stateField']
    },

    run: function(val) {
        if (val != undefined) {
            this._run = val;
            this.onWBtnClick();
        }
        return this._run;
    },

    _fontColor : function(val) {
        this._super(val);
        this._super(val, this.base().find("input:eq(0)"));
        this._super("", this.base().find("input:eq(1)"));
    },

    _font : function(val) {
        this._super(val);
        this._super(val, this.base().find("input:eq(0)"));
        this._super("", this.base().find("input:eq(1)"));
    },

    /*calculateHeight: function(height) {
        this._super(height);
        this._wBtn.css("width", this.height());
    },*/

    _updateLayout: function(){
        this._super();
        //this._weatherDiv.width(this.width())
        this._weatherDiv.height(this.height());
        this._input.width(this.width())
                   .height(this.height());
        this._wBtn.width(this.height())
                  .height(this.height());
    },

    _btnText: function(val) {
        $(this._wBtn).val(val);
    },

    /**
     * Return widget data model
     */
    getDataModel: function() {
        var values = [
            {name: "widget_ext_weather", value: "", uid: "exampleuid"}
        ];
        return values;
    }
});

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.btnText
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.isUnique,
        AC.Property.database.mandatoryHighlight,
        AC.Property.database.mandatory
    ]},
    { name: AC.Property.group_names.layout, props:[
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.pWidthHidden,
        AC.Property.layout.widthHidden,
        AC.Property.layout.heightHidden,
        AC.Property.layout.sizes,
        AC.Property.layout.minWidth,
        AC.Property.layout.maxWidth,
        AC.Property.layout.maxHeight,
        AC.Property.layout.zindex,
        AC.Property.layout.tabindex,
        AC.Property.layout.tabStop,
        AC.Property.layout.anchors,
        AC.Property.layout.repeat,
        AC.Property.layout.alignInContainer
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.resizing,
        AC.Property.behavior.visible,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.data, props:[
        {name: "showBtn", type : "boolean", set:"showBtn", get:"showBtn", alias : "widget_ext_weather_prop_showbtn"},
        {name: "zipCode", type : "text", set:"zipCode", get:"zipCode", alias : "widget_ext_weather_prop_zipcode"},
        {name: "failField", type : "widgetlist", set:"failField", get:"failField", alias : "widget_ext_weather_prop_failfield"},
        {name: "cityField", type : "widgetlist", set:"cityField", get:"cityField", alias : "widget_ext_weather_prop_cityfield"},
        {name: "stateField", type : "widgetlist", set:"stateField", get:"stateField", alias : "widget_ext_weather_prop_statefield"},
        {name: "gridField", type : "weathergridcolumn", set:"gridField", get:"gridField", alias : "widget_ext_weather_prop_gridfield"},
        {name: "gMap", type : "gmapswidgetlist", set:"gMap", get:"gMap", alias : "widget_ext_weather_prop_gmap"},
        {name: "failText", type : "text", set:"failText", get:"failText", alias : "widget_ext_weather_prop_failtext"}
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.font,
        AC.Property.style.fontColor,
        AC.Property.style.margin,
        AC.Property.style.boxSizing,
        AC.Property.style.border,
        AC.Property.style.borderRadius,
        AC.Property.style.bgColor,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_WeatherWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_WeatherWidget.emptyProps = function() {
    var ret = {};
    return ret;
};

/**
 * Return widget inline edit prop name
 * @return {String} default properties
 */
WiziCore_UI_WeatherWidget.inlineEditPropName = function() {
    return "zipCode";
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_WeatherWidget.defaultProps = function() {
    var ret = {valName : "currText", width: "100", height: "20", x : "100", y: "100", zindex : "auto",
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true, enable : true, widgetStyle: "default",
        opacity : 1, name: "Weather1", textAlign: "Left", showBtn: true, margin: "", alignInContainer: 'left', pWidth: "", tabStop: true,
        dragAndDrop: false, customCssClasses: "", boxSizing: 'border-box',
        resizing: false
    };
    return ret;
};

WiziCore_UI_WeatherWidget.onSuccess = "E#Weather#onSuccess";
WiziCore_UI_WeatherWidget.onFail = "E#Weather#onFail";
WiziCore_UI_WeatherWidget.onError = "E#Weather#onError";
/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_WeatherWidget.actions = function() {
    var ret = {
        onSuccess : {alias : "widget_ext_weather_event_onsuccess", funcview : "onSuccess", action : "AC.Widgets.WiziCore_UI_WeatherWidget.onSuccess", params : "json", group : "widget_ext_weather_event_group"},
        onFail : {alias : "widget_ext_weather_event_onfail", funcview : "onFail", action : "AC.Widgets.WiziCore_UI_WeatherWidget.onFail", params : "json", group : "widget_ext_weather_event_group"},
        onError : {alias : "widget_ext_weather_event_onerror", funcview : "onError", action : "AC.Widgets.WiziCore_UI_WeatherWidget.onError", params : "json", group : "widget_ext_weather_event_group"}
    };
    // append base actions
    //ret = jQuery.extend(AC.Widgets.Base.actions(), ret);
    return ret;
};


/* Lang constants */
/**
 * Return available widget langs
 * @return {Object} available actions
 */
WiziCore_UI_WeatherWidget.langs = function() {
    var ret = {"en" : {}};
    /* Lang constants */
    ret.en.widget_ext_weather = "Weather";
    ret.en.widget_ext_name_weather = "Weather";
    ret.en.widget_ext_weather_type = "Example Type";
    ret.en.widget_ext_weather_dlg_type_title = "Example Dialog Type";
    ret.en.widget_ext_weather_prop_failfield = "Fail Field";
    ret.en.widget_ext_weather_prop_zipcode = "Zip Code";
    ret.en.widget_ext_weather_prop_cityfield = "City Field";
    ret.en.widget_ext_weather_prop_statefield = "State Field";
    ret.en.widget_ext_weather_prop_gridfield = "Grid Field";
    ret.en.widget_ext_weather_prop_call = "Call";
    ret.en.widget_ext_weather_prop_showbtn = "Show Button";
    ret.en.widget_ext_weather_prop_btntext = "Button Text";

    ret.en.widget_ext_weather_prop_date = "Date";
    ret.en.widget_ext_weather_prop_desc = "Description";
    ret.en.widget_ext_weather_prop_low = "Low";
    ret.en.widget_ext_weather_prop_high = "High";
    ret.en.widget_ext_weather_prop_icon = "Icon";
    ret.en.widget_ext_weather_prop_precip = "Precip";

    ret.en.widget_ext_weather_prop_dlg_grids_title = "Select Grids";
    ret.en.widget_ext_weather_prop_dlg_grids = "Grids";
    ret.en.widget_ext_weather_prop_dlg_columns = "Columns";
    ret.en.widget_ext_weather_prop_dlg_column_name = "Column Name";
    ret.en.widget_ext_weather_prop_dlg_column_value = "Field";
    ret.en.widget_ext_weather_prop_gmap = "Google Maps";

    ret.en.widget_ext_weather_event_group = "Weather Events";
    ret.en.widget_ext_weather_event_onsuccess = "On Success";
    ret.en.widget_ext_weather_event_onfail = "On Fail";
    ret.en.widget_ext_weather_event_onerror = "On Error";
    ret.en.widget_ext_weather_prop_failtext = "Fail Text";
    ret.en.widget_ext_weather_error = "Weather Error";
    ret.en.widget_ext_weather_fail = "Weather Warning";

    return ret;
};
AC.Core.lang().registerWidgetLang(WiziCore_UI_WeatherWidget.langs());
/* Register widget in the Designer */
AC.Core.Widgets().registerExWidget("WiziCore_UI_WeatherWidget", "sections_extensible", "widget_ext_name_weather", "example",
        "wiziCore/extWidgets/weather/weather.png");
if (AC.designerMode) {
    (function(gType){
    /**
     * resource grid type
     */
    gType.weathergridcolumn = function(cell) {
        //set cell to var
        this.cell(cell);

        this._template = '<div style=\"position: relative\">\n    <table style=\"width: 100%; height: 100%;\">\n        <tr valign=\"top\">\n            <td  style=\"width:200px; padding: 0 2px;\">\n                <span class=\"wa-ui-dialog-c-title\">\n                    <span data-lng=\"ac-widget_ext_weather_prop_dlg_grids\"><\/span>\n                <\/span>\n                <br>\n                <div class=\"wa-ui-dialog-content\">\n                    <div id=\"waWeatherGridDlgList\" ><\/div>\n                <\/div>\n            <\/td>\n            <td  style=\"padding: 0 2px;\">\n                <span class=\"wa-ui-dialog-c-title\">\n                    <span data-lng=\"ac-widget_ext_weather_prop_dlg_columns\"><\/span>\n                <\/span>\n                <br>\n                <div class=\"wa-ui-dialog-content\">\n                    <div id=\"waWeatherGridDlgColumn\" ><\/div>\n                <\/div>\n            <\/td>\n        <\/tr>\n    <\/table>\n<\/div>';
        //buffer value
        this._input = null;

        this.setValue = function(val) {
            //this method must be in code
            var viewVal = "";
            if (typeof val == "object" && val != null && val.gridName != undefined) {
                viewVal = val.gridName;
            }
            this.cell().empty().append(viewVal);
            //current value
            this.sValue = val;
        };

        this.edit = function() {
            //this method must be in code
            var self = this,
                value = this._tmpValue = this.getValue(), // this._tmpValue - > defined in dialogType
                context = this.context(),
                editor = this.getEditor();

            this._gridList = {};

            var gridDlg = this._tmpDialog = $(this._template);
            $(document.body).append(gridDlg);

            var title =  AC.Core.lang().trText("widget_ext_weather_prop_dlg_grids_title");
            var ok =  AC.Core.lang().trText("dialog_button_ok");
            var cancel =  AC.Core.lang().trText("dialog_button_cancel");

            var btn = {};

            function closeDialog(){
                self.closeDialog.apply(self, arguments);
            }

            btn[cancel] = function() {
                closeDialog();
            };

            btn[ok] = function() {
                closeDialog(self.saveValue());
            };

            var props = jQuery.extend({
                modal : true,
                height: 330,
                width: 430,
                resizable : false,
                title : title,
                buttons: btn,
                close: function(event, ui) {
                    if (self._queriesTree){
                        self._queriesTree.destroy();
                        self._queriesTree = undefined;
                    }
                    self.onClose(); //called dialogType method for destroy dialog and call cell.editStop()
                },
                dialogClass: "wa-system-dialog wa-system-style"
            }, {});

            gridDlg.dialog(props);
            gridDlg.parent().click(function(ev) {
                //set stop propagation for any click by parent of dialog
                ev.stopPropagation();
            });
            gridDlg.css("opacity", "0.9");

            var currApp = editor.form();
            var treeData = this.buildTree(currApp);
            var tree = this._queriesTree = new jqSimpleTree($("#waWeatherGridDlgList"), treeData);
            tree.base().height(200);
            tree.base().width(200);

            $(tree).bind(jqSimpleTree.onSelect, function(ev, id) {
                self.updateColModel(id);
            });

            var cmodel = [
                {title:  AC.Core.lang().trText("widget_ext_weather_prop_dlg_column_name"), width:"50%", align:"center", type:"ed"},
                {title:  AC.Core.lang().trText("widget_ext_weather_prop_dlg_column_value"), width: "50%", align:"center", type:"weathergridfield"}
            ];

            var datatable = this._datatable = new jqSimpleGrid(gridDlg.find("#waWeatherGridDlgColumn"), [], {model: cmodel});

            $(datatable).bind(jqSimpleGrid.onCellChanged, function(ev, rId, cPos, nValue) {
                var selGridUid = self._queriesTree.getSelectedNodeId();
                var gridData = self._gridList[selGridUid];
                if (gridData == undefined) {
                    self._gridList[selGridUid] = {};
                }
                self._gridList[selGridUid][rId] = nValue;
            });

            if (value && value.gridUid !== undefined) {
                if (value.colData != undefined) {
                    this._gridList[value.gridUid] = value.colData;
                }
                tree.selectNode(value.gridUid, true);
            }
        };

        this.updateColModel = function(id) {
            var editor = this.getEditor();
            var form = editor.form();
            var widget = form.find(id);
            if (widget && widget.widgetClass() == "WiziCore_UI_GridWidget") {
                var colmodel = widget.prop("colmodel");
            }
            var db = this._datatable;
            var data = this._gridList[id];
            if (data == undefined) {
                this._gridList[id] = {};
                data = this._gridList[id];
            }
            if (db != undefined) {
                var cnt = 0, subData = [], row;
                for (var i in colmodel) {
                    var col = colmodel[i];
                    var value = (data != undefined && data[col.colUid] != undefined) ? data[col.colUid] : "none";
                    row = [col.title, value];
                    row.id = col.colUid;
                    subData.push(row);
                    data[col.colUid] = value;
                }
                db.setData(subData);
            }
        };

        this.buildTree = function(object) {
            var wClass = object.widgetClass(),
                wContainerType = AC.Core.Widgets().getContainerType(wClass);
            if ((wClass == "WiziCore_UI_GridWidget") || (wContainerType != AC.Widgets.Base.CASE_TYPE_ITEM)) {
                var name = object.name(),
                    id = object.id(),
                    node = {title : name, id : id},
                    children = object.children();
                for (var i = 0, l = children.length; i < l; i++) {
                    var child = this.buildTree(children[i]);
                    if (child != undefined){
                        (node.nodes == undefined) ? node.nodes = [child] : node.nodes.push(child);
                    }
                }
                return node;
            }
        };

        this.saveValue = function() {
            var self = this,
                selGridUid = self._queriesTree.getSelectedNodeId(),
                gridData = self._gridList[selGridUid],
                editor = this.getEditor(),
                form = editor.form(),
                widget = form.find(selGridUid),
                value = null;
            if (widget && widget.widgetClass() == "WiziCore_UI_GridWidget") {
                var gridName = widget.name();
                var colModel = widget.colmodel();
                var colArr = "";
                for (var i in colModel) {
                    if (colArr != "") {
                        colArr += ",";
                    }
                    colArr += gridData[colModel[i].colUid];
                }
                value = {gridUid : selGridUid, colValue : colArr, gridName: gridName, colData: gridData};
            }

            return value;
        }
    };

    gType.weathergridcolumn.prototype = new gType.dialogType;


    /**
     * weatherGridField list
     */
    makeCellList('weathergridfield', {
        _defOpt: "none",
        langOpt: {
            "none" : "",
            "date" : "widget_ext_weather_prop_date",
            "desc" : "widget_ext_weather_prop_desc",
            "low" : "widget_ext_weather_prop_low",
            "high": "widget_ext_weather_prop_high",
            "icon" : "widget_ext_weather_prop_icon",
            "precip" : "widget_ext_weather_prop_precip"
        }
    });

    /**
     * weatherGridField list
     */
    gType.gmapswidgetlist = function(cell) {
        this.cell(cell);
        this._filter = "WiziCore_UI_GoogleMapsWidget";
    };

    gType.gmapswidgetlist.prototype = new gType.widgetlist;
    })(jqSimpleGrid.types);
}
})(jQuery,window,document);