/**
 * @lends       WiziCore_UI_GoogleMapsWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_GoogleMapsWidget = AC.Widgets.WiziCore_UI_GoogleMapsWidget = AC.Widgets.Base.extend({
    triggerObject : {},
    _widgetClass : "WiziCore_UI_GoogleMapsWidget", //widget Class name
    _dataPropName : "latlong", //the method name, which is responsible for working with data
    _gMapDiv: null,//jQuery object
    _gMap: null,
    _mapCanIniting: null,
    _marker: null,
    _onClick: null,
    _loaded: false,

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

    /**
     * Building widget function
     */
    draw : function() {
        var self = this;
        if (typeof GMap2 != "function") {
            $(this.triggerObject).one(AC.Widgets.WiziCore_UI_GoogleMapsWidget.onApiLoaded, function(ev, data) {
                if (self._mapCanIniting !== null){
                    self.apiInited();
                }
                self._loaded = true;
                ev.stopPropagation();
            });
        }
        else {
            self._loaded = true;
        }
        var div = $("<div>");
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            div.resize(function(){self._resizeGmap();});
        }
        var tuid = "gmaps_" + this.htmlId();
        div.attr("id", tuid);
        div.css({width: "100%", height: "100%"});
        this.base().prepend(div);
        this._gMapDiv = div;
        this._super.apply(this, arguments);
    },

    onPageDrawn: function() {
        this._mapCanIniting = false;
        if (typeof GMap2 == "function") {
            this.apiInited();
        }
        this._super.apply(this, arguments);
    },

    _updateLayout: function(){
        this._super();
        this._gMapDiv.height(this.height() + 'px');
//        this._gMapDiv.css({'min-width': this.width() + 'px', 'min-height' :this.height() + 'px'});
        this._resizeGmap();
        this.checkResize();
    },

    relativeResize: function() {
        this._super.apply(this);
        this._resizeGmap();
    },

    _resizeGmap: function() {
        if (!this._gMap) {
            return;
        }

        var gMap = this._gMap;
        setTimeout(function(){gMap.checkResize();}, 10);
    },

    earlyLoad: function(callback) {
        if (!this._loaded) {
            var self = this;
            window.setTimeout(function(){self.earlyLoad(callback)}, 100);
            return;
        }
        if (callback) {
            callback();
        }
    },

    initProps: function() {
        this._super();
        this.shadow = this.themeProperty('shadow', this._shadow);
        this.border = this.themeProperty('border', this._border);
        this.bg = this.themeProperty('bgColor', this._bg);

        this.opacity = this.htmlProperty('opacity', this._opacity);
        //this.tabindex = this.htmlProperty('tabindex', this._tabindex);

        this.showMarker = this.normalProperty('showMarker', this.initMarker);
        this.googleBar = this.htmlProperty('googleBar', this._googleBar);
        this.googleKey = this.htmlProperty('googleKey', this._googleKey);
        this.aspectResize = this.htmlProperty('aspectResize', this._updateLayout);
    },

    initDomState : function () {
        this._super();
        this.initDomStatePos();
        this._googleKey(this.googleKey());
        this._googleBar(this.googleBar());
        this.initMarker();

        this._bg(this.bg());
        this._border(this.border());
        this._shadow(this.shadow());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        //this._tabindex(this.tabindex());

    },

    initGMaps: function(apiKey) {
        this.clearMap();
        var self = this;
        if (WiziCore_Helper.googleMapsApiVersion == 3 && this._hasAnotherGmapWidget()) {
            var dlg = WiziCore_Helper.showWarning('', AC.Core.lang().trText("widget_google_maps_conflict_api_message"), false, WiziCore_UI_MessageBoxWidget.MB_YESNO);
            $(dlg).one(WiziCore_UI_MessageBoxWidget.onDialogClose, function(ev, id, res) {
                if (id == WiziCore_UI_MessageBoxWidget.IDYES){
                    self._loadApi(apiKey);
                }
            });
        } else
            this._loadApi(apiKey)

    },

    _hasAnotherGmapWidget: function() {
        var res = false, form = this.form();
        if (form) {
            form.traverseChildren(function(child){
                if (typeof child.widgetClass == 'function' && child.widgetClass() == 'GoogleMapsAdvanced') {
                    res = true;
                    return true;
                }
            });
        }
        return res;
    },

    _loadApi: function(apiKey) {
        if (typeof GMap2 != "function") {
            WiziCore_Helper.googleMapsApiVersion = 2;
            var link = (document.location.protocol == "https:" ? "https:" : "http:") + "//maps.google.com/maps?file=api&v=2&sensor=true&async=2&key=" + apiKey + "&callback=gMapWidgetApiLoaded";
            if (WiziCore_Helper.isPhoneGapOnline()) {
                jQuery.getScript(link)
                    .fail(function(jqxhr, settings, exception){
                        throw "error loading " + link;
                    });
            }
        }
    },

    apiInited: function() {
        this._mapCanIniting = true;
        acDebugger.systemLog("apiInited for ", this.widgetId());
        this.createGMap(this.zoomLevel());
    },

    clearMap: function() {
        if (typeof GMap2 == "function" && typeof GEvent == "object") {
            if (this._onClick != null) {
                GEvent.removeListener(this._onClick);
                delete this._onClick;
                this._onClick = null;
            }
        }
        if (typeof GUnload == "function") {
            //GUnload();
        }
        delete this._gMap;
        this._gMap = null;
    },

    createGMap: function(zoomLevel) {
        if (this._mapCanIniting === true) {
            //this._gMap = null;
            var map = this._gMap;
            var self = this;
            var tuid = this._gMapDiv.attr("id");
            if (GBrowserIsCompatible()) {
                if (zoomLevel == undefined){
                    if (map && typeof map['getZoom'] == "function"){
                        zoomLevel = map.getZoom();
                    } else {
                        zoomLevel = this.zoomLevel();
                    }
                }
                var mapType = undefined;
                if (map && typeof map['getCurrentMapType'] == "function"){
                    mapType = map.getCurrentMapType();
                }
                delete this._gMap;

                this._gMapDiv.empty();
                map = new GMap2(document.getElementById(tuid));
                this._gMap = map;

                mapType = (mapType == undefined) ? map.getCurrentMapType() : mapType;
                map.setMapType(mapType);

                map.setCenter(new GLatLng(this.latitude(), this.longitude(), false), zoomLevel);
                map.setUIToDefault();
                (this.googleBar()) ? map.enableGoogleBar() : map.disableGoogleBar();
                if (this._onClick != null) {
                    GEvent.removeListener(this._onClick);
                }
                this._onClick = GEvent.bind(map, "click", this, function(overlay, latlng) {
                    self.onClick(overlay, latlng);
                });
                this._gMap = map;
                this.initMarker();
            }
            this._gMapDiv.css("z-index", "");
            this._updateEnable();
        }
    },

    onClick: function(overlay, latlng) {
        if (this._gMap != null) {
            if (latlng) {
                var myHtml = "The GPoint value is: " + this._gMap.fromLatLngToDivPixel(latlng) + " at zoom level " + this._gMap.getZoom();
            }
            //alert(myHtml);
            var triggerEvent = new jQuery.Event(AC.Widgets.Base.onClick);
            $(this.object()).trigger(triggerEvent, [overlay, latlng]);
        }
    },
    remove: function() {
        this.clearMap();
        $(this.triggerObject).unbind(AC.Widgets.WiziCore_UI_GoogleMapsWidget.onApiLoaded);
        this._super();
    },

    _enable: function(flag){
        if (this._gMap != null){
            this.showEnableDiv(flag);
        } else if (this._gMapDiv != null) {
            (flag === false) ? this._gMapDiv.addClass('ui-state-disabled') : this._gMapDiv.removeClass('ui-state-disabled');
        }
    },

    _googleBar: function(val) {
        if (this._gMap != null) {
            if (val) {
                this._gMap.enableGoogleBar();
            } else {
                this._gMap.disableGoogleBar();
            }
        }
    },

    getDomain : function(url){
        if (typeof url != "string")
            return url;

        var startPos = url.indexOf("//");
        if (startPos == -1)
            startPos = 0;

        var endPos = url.indexOf("/", startPos + 2);
        if (endPos == -1)
            endPos = url.length;

        return url.substring(startPos + 2, endPos);
    },

    _googleKey: function(val) {
        if (val != undefined) {
            var self = this;
            var apiKey = null;
            var pathname = this.getCurrentPathName().toLowerCase();
            var locDomain = this.getDomain(pathname);
            if (locDomain == '' || locDomain == 'localhost') {
                apiKey = '';
            }
            else if (val.rows != undefined) {
                //get data from prefill dialog
                for (var i =0, l= val.rows.length; i < l; i++) {
                    var loc = val.rows[i].data[0].toLowerCase();
                    var loc = this.getDomain(loc);
                    if (pathname.indexOf(loc) >= 0) {
                        apiKey = val.rows[i].data[1];
                        break;
                    }
                }
            }

//            if (apiKey === null) {
//                //try to find in config
//                try {
//                    var wfApp = WiziCore_AppContext.getInstance();
//                    if (wfApp != undefined) {
//
//                        var key = wfApp.config().googleApiKey();
//                        for (var i = 0, l = key.rows.length; i < l; i++) {
//                            var loc = key.rows[i].data[0].toLowerCase();
//                            var loc = this.getDomain(loc);
//                            if (pathname.indexOf(loc) >= 0) {
//                                apiKey = key.rows[i].data[1];
//                                break;
//                            }
//                        }
//                    }
//                } catch(e) {
//                }
//
//            }

            if (apiKey === null) {
                var key = this.form() ? this.form().gmapsApiKey() : null;
                if (key != null && key != '')
                    apiKey = key;
            }

            if (apiKey !== null) {
//                apiKey = (apiKey == 'none')? '': apiKey;
                self.initGMaps(apiKey);
            } else {
                var noApiDiv = $("<div style='font: 14px normal; text-align: center; width : 100%; height:100%; background-color: #808080; color: white; display: table-caption;' ></div>")
                        .append("<span data-lng='ac-widget_gmap_noapikey'/><span><b>'"+ pathname +"'</b></span><br>")
                        .append("<span data-lng='ac-widget_gmap_edit_gapikeyprop'/>");

                self._gMap = null;
                self._gMapDiv.empty().append(noApiDiv);
            }
        }
    },

    googleMap: function(){
        return this._gMap;
    },

    getCurrentPathName : function() {
        return window.location.hostname;
    },

    latitude: function(val) {
        if (val != undefined) {
            val = (val > 90) ? val % 90 : val;
            val = (val < -90) ? val % -90 : val;
            this._project['latitude'] = val;
            var obj = {"latitude": this._project['latitude']};
            this.sendExecutor(obj);
            if (this._isDrawn) {
                this.createGMap();
            }
        }
        return this._project['latitude'];
    },

    longitude: function(val) {
        if (val != undefined) {
            val = (val > 180) ? val % 180 : val;
            val = (val < -180) ? val % -180 : val;
            this._project['longitude'] = val;
            var obj = {"longitude": this._project['longitude']};
            this.sendExecutor(obj);
            if (this._isDrawn) {
                this.createGMap();
            }
        }
        return this._project['longitude'];
    },

    initMarker: function() {
        if (this._gMap !== null) {
            //create marker, if not init
            var latlng = new GLatLng(this.latitude(), this.longitude());
            if (this._marker !== null) {
                this._gMap.removeOverlay(this._marker);
            }
            this._marker = new GMarker(latlng);
            this._gMap.addOverlay(this._marker);
        }

        if (this._marker !== null) {
            if (this.showMarker() == true) {
                this._marker.show()
            } else {
                this._marker.hide()
            }
        }
    },

    zoomLevel: function(val) {
        if (val != undefined) {
            this._project['zoomLevel'] = Math.round(val);
            var obj = {"zoomLevel": this._project['zoomLevel']};
            this.sendExecutor(obj);
            if (this._isDrawn && this._gMap != null) {
                this._gMap.setZoom(this._project['zoomLevel']);
            }
        }
        return this._project['zoomLevel'];
    },

    latlong: function(val) {
        if (val != undefined) {
            ret = [this.latitude(val[0]), this.longitude(val[1])];
        } else {
            var ret = [this.latitude(), this.longitude()];
        }
        return ret;
    },

    getDataModel: function() {
        return [
            {name: "widget_gmap_latitude", value: "", uid: "latuid"},
            {name: "widget_gmap_longitude", value: "", uid: "longuid"}
        ];
    }
});

WiziCore_UI_GoogleMapsWidget.beforeInit = function(form) {
    form.traverseChildren(function(child){
        if (typeof child.widgetClass == 'function' && child.widgetClass() == 'GoogleMapsAdvanced') {
            WiziCore_Helper.showWarning('', AC.Core.lang().trText("widget_google_maps_conflict_message"), false, WiziCore_UI_MessageBoxWidget.MB_OK);
            throw 'google maps widgets conflict!';
        }
    });
};

    window['gMapWidgetApiLoaded'] = function() {
    $(AC.Widgets.WiziCore_UI_GoogleMapsWidget.prototype.triggerObject).trigger(AC.Widgets.WiziCore_UI_GoogleMapsWidget.onApiLoaded);
};

AC.Widgets.WiziCore_UI_GoogleMapsWidget.onApiLoaded = "E#GoogleMaps#onApiLoaded";

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        {name: "googleKey", type : "gmapkeysdata", get: "googleKey", set: "googleKey", alias : "widget_gmap_googlekey"},
        {name: "googleBar", type : "boolean", get: "googleBar", set: "googleBar", alias : "widget_gmap_googlebar"},
        {name: "latitude", type : "gmlatitude", get: "latitude", set: "latitude", alias : "widget_gmap_latitude"},
        {name: "longitude", type : "gmlongitude", get: "longitude", set: "longitude", alias : "widget_gmap_longitude"},
        {name: "showMarker", type : "boolean", get: "showMarker", set: "showMarker", alias : "widget_gmap_showmarker"},
        {name: "zoomLevel", type : "gmzoomlevel", get: "zoomLevel", set: "zoomLevel", alias : "widget_gmap_zoomlevel"}
    ]},
    { name: AC.Property.group_names.layout, props:[
        AC.Property.layout.aspectResize,
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.pWidth,
        AC.Property.layout.width,
        AC.Property.layout.height,
        AC.Property.layout.repeat,
        AC.Property.layout.zindex,
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.resizing,
        AC.Property.behavior.visible,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.data, props:[
        AC.Property.data.view,
        AC.Property.data.fields,
        AC.Property.data.groupby,
        AC.Property.data.orderby,
        AC.Property.data.filter,
        AC.Property.data.onview,
        AC.Property.data.applyview,
        AC.Property.data.listenview,
        AC.Property.data.resetfilter,
        AC.Property.data.autoLoad
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.border,
        AC.Property.style.shadow,
        AC.Property.style.margin,
        AC.Property.style.bgColor,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_GoogleMapsWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_GoogleMapsWidget.emptyProps = function() {
    return {};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_GoogleMapsWidget.inlineEditPropName = function() {
    return "latlong";
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_GoogleMapsWidget.defaultProps = function() {
    var ret = {width: "200", height: "200", x : "100", y: "100", zindex : "auto",
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
        opacity : 1, name: "googleMaps1", googleBar: false, latitude: "37.4419", longitude: "-122.1419",
        zoomLevel: 12, widgetStyle: "default", showMarker:false,
        googleKey : {}, enable: true,
        margin: "", alignInContainer: 'left',
        dragAndDrop: false, customCssClasses: "",
        resizing: false,
        aspectResize: false
    };
//    var wfApp = WiziCore_AppContext.getInstance();
//    if (wfApp != undefined) {
//        try {
//            var key = wfApp.config().googleApiKey();
//            if (key != undefined && key != null) {
//                ret.googleKey = key;
//            }
//        } catch(e) {
//        }
//    }
    return ret;
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_GoogleMapsWidget.actions = function() {
    var ret = {};
    // append base actions
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    if (ret.click != undefined){
        ret.click.params = "overlay, latlng";
    }
    WiziCore_UI_GoogleMapsWidget.actions = function(){return ret};
    return ret;
};

/* Register widget in the Designer */
AC.Core.Widgets().registerExWidget("WiziCore_UI_GoogleMapsWidget", "widget_cat_deprecated", "widget_name_gmap", "gmaps",
        "wiziCore/extWidgets/googleMaps/googleMaps.png");

/* Lang constants */
/**
 * Return available widget langs
 * @return {Object} available actions
 */
WiziCore_UI_GoogleMapsWidget.langs = function() {
    var ret = {"en" : {}};
    /* Lang constants */
    ret.en.widget_gmap_googlekey = "Google Api Key";
    ret.en.widget_name_gmap = "Google Maps";
    ret.en.widget_gmap_googlebar = "Google Bar";
    ret.en.widget_gmap_latitude = "Latitude";
    ret.en.widget_gmap_longitude = "Longitude";
    ret.en.widget_gmap_showmarker = "Show Marker";
    ret.en.widget_gmap_zoomlevel = "Zoom";
    ret.en.widget_gmap_hostname = "Host Name";
    ret.en.widget_gmap_apikey = "Google Map Key";
    ret.en.widget_gmap_apikeys = "Api Keys";
    ret.en.widget_gmap_noapikey = "Haven't Google Api Keys for this domain '";
    ret.en.widget_gmap_edit_gapikeyprop = "' please edit property 'Google Api Key'";
    return ret;
};
AC.Core.lang().registerWidgetLang(WiziCore_UI_GoogleMapsWidget.langs());
/* Types */

if (window['jqSimpleGrid'] && window['jqSimpleGrid'].types && window['jqSimpleGrid'].types['basenumber']) {
    (function(gType){
    /**
     * latitude
     */
    gType.gmlatitude = function(cell){
        this.cell(cell);
        this._params = {
            min : -90,
            max: 90,
            isFloat: true
        };
    };
    gType.gmlatitude.prototype = new gType.basenumber;
    /**
     * longtitude
     */
    gType.gmlongitude = function(cell) {
        this.cell(cell);
        this._params = {
            min : -180,
            max: 180,
            isFloat: true
        };
    };
    gType.gmlongitude.prototype = new gType.basenumber;

    })(jqSimpleGrid.types);
}

if (!tick) {
    //google FIX
    var tick = function() {
    }
}

})(jQuery,window,document);