L.Control.Measure = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);

        this._enabled = false;
        this._container = null;
        this._buttonM = null;
        this._buttonD = null;
        this._map = null;

        this._features = new L.FeatureGroup();

        this._startPoint = null;
        this._endPoint = null;
        this._line = null;
    },

    onAdd: function (map) {
        this._map = map;
        this._features.addTo(map);

        this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-measure');
        this._buttonM = L.DomUtil.create('a', '', this._container);
        this._buttonM.href = '#';
        this._buttonM.innerHTML = 'M';
        this._buttonM.title = 'Measure';
        this._buttonD = L.DomUtil.create('a', '', this._container);
        this._buttonD.href = '#';
        this._buttonD.innerHTML = 'D';
        this._buttonD.title = 'Delete all measures';

        L.DomEvent
            .on(this._buttonM, 'click', L.DomEvent.stopPropagation)
            .on(this._buttonM, 'mousedown', L.DomEvent.stopPropagation)
            .on(this._buttonM, 'dblclick', L.DomEvent.stopPropagation)
            .on(this._buttonM, 'click', L.DomEvent.preventDefault)
            .on(this._buttonM, 'click', this._onClickM, this);
        L.DomEvent
            .on(this._buttonD, 'click', L.DomEvent.stopPropagation)
            .on(this._buttonD, 'mousedown', L.DomEvent.stopPropagation)
            .on(this._buttonD, 'dblclick', L.DomEvent.stopPropagation)
            .on(this._buttonD, 'click', L.DomEvent.preventDefault)
            .on(this._buttonD, 'click', this._onClickD, this);

        return this._container;
    },

    _enable: function() {
        this._startPoint = null;
        this._endPoint = null;
        this._line = null;

        this._enabled = true;
        L.DomUtil.addClass(this._buttonM, 'leaflet-control-measure-enabled');
        this._map.on('click', this._onMapClick, this);
    },
    _disable: function() {
        this._enabled = false;
        L.DomUtil.removeClass(this._buttonM, 'leaflet-control-measure-enabled');
        this._map.off('click', this._onMapClick, this);
    },

    _onClickM: function() {
        if (this._enabled) this._disable();
        else               this._enable();
    },
    _onClickD: function() {
        this._features.clearLayers();
    },

    _onMapClick: function(e) {
        var marker = new L.Marker(e.latlng, { draggable:false });
        marker.bindPopup('Lng: ' + e.latlng.lng.toFixed(6) + '<br />Lat: ' + e.latlng.lat.toFixed(6));
        this._features.addLayer(marker);

        if (this._startPoint === null) {
            this._startPoint = e.latlng;

        }
        else if (this._endPoint === null) {
            this._endPoint = e.latlng;

            this._line = new L.Polyline([ this._startPoint, this._endPoint ], { color: 'black', opacity: 0.5, stroke: true });
            this._features.addLayer(this._line);

            var distance = this._startPoint.distanceTo(this._endPoint);
            var sz  = 'Distance: ' + (distance > 50000 ? (distance/1000).toFixed(2) + ' km.' : distance.toFixed(2) + ' m.');
            this._line.bindPopup(sz).openPopup();

            this._disable();
        }
        //marker.on('drag', this._updateRuler, this);
    },

    _updateRuler: function(e) {
    }
});

L.control.Measure = function(options) {
    return new L.Control.Measure(options);
};

L.Map.mergeOptions({
    measureControl: false
});

L.Map.addInitHook(function() {
    if (this.options.measureControl) {
        this.measureControl = new L.Control.Measure();
        this.addControl(this.measureControl);
    }
});