L.Control.Measure = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);

        this._enabled = false;
        this._container = null;
        this._button = null;
        this._buttonD = null;
        this._map = null;

        this._features = new L.FeatureGroup();
        this._markerList = [];

        this._startPoint = null;
        this._endPoint = null;
        this._line = null;
    },

    onAdd: function (map) {
        this._map = map;
        this._features.addTo(map);

        this._container = L.DomUtil.create('div', 'leaflet-control-measure leaflet-bar leaflet-control');
        this._button = L.DomUtil.create('a', 'leaflet-bar-part', this._container);
        this._button.href = '#';
        this._button.innerHTML = 'M';
        this._button.title = 'Measure';

        L.DomEvent
            .on(this._button, 'click', L.DomEvent.stopPropagation)
            .on(this._button, 'mousedown', L.DomEvent.stopPropagation)
            .on(this._button, 'dblclick', L.DomEvent.stopPropagation)
            .on(this._button, 'click', L.DomEvent.preventDefault)
            .on(this._button, 'click', this._onClick, this);

        return this._container;
    },

    _enable: function() {
        this._startPoint = null;
        this._endPoint = null;
        this._line = null;

        this._features.clearLayers();
        this._markerList = [];

        this._enabled = true;
        L.DomUtil.addClass(this._button, 'leaflet-control-measure-enabled');
        this._map.on('click', this._onMapClick, this);
    },
    _disable: function() {
        this._enabled = false;
        L.DomUtil.removeClass(this._button, 'leaflet-control-measure-enabled');
        this._map.off('click', this._onMapClick, this);
    },

    _onClick: function() {
        if (this._enabled) this._disable();
        else               this._enable();
    },

    _onMapClick: function(e) {
        var marker = new L.Marker(e.latlng, { draggable: true });
        marker.bindPopup('Lng: ' + e.latlng.lng.toFixed(6) + '<br />Lat: ' + e.latlng.lat.toFixed(6));
        marker.on('drag', this._onMarkerDrag, this);
        marker.on('dragend', this._onMarkerDragEnd, this);

        this._features.addLayer(marker);
        this._markerList.push(marker);

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
    },

    _onMarkerDrag: function(e) {
        var marker = e.target;
        var i = this._markerList.indexOf(marker);

        var listLatng = this._line.getLatLngs();
        listLatng[i] = marker.getLatLng();
        this._line.setLatLngs(listLatng);

        if (i == 0)
            this._startPoint = marker.getLatLng();
        else if (i == (this._markerList.length - 1))
            this._endPoint = marker.getLatLng();
    },
    _onMarkerDragEnd: function(e) {
        var distance = this._startPoint.distanceTo(this._endPoint);
        var sz  = 'Distance: ' + (distance > 50000 ? (distance/1000).toFixed(2) + ' km.' : distance.toFixed(2) + ' m.');
        this._line.bindPopup(sz).openPopup();
    }
});

L.control.measure = function(options) {
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