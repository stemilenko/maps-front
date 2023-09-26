import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import {Icon, Text, Style, Stroke, Fill} from 'ol/style.js';
import Point from 'ol/geom/Point.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import KML from 'ol/format/KML.js';
import {fromLonLat, toLonLat} from 'ol/proj.js';

const sep = ';';
let osmTileServerURL = window.location.protocol + '//' + window.location.hostname + ':90/tile/{z}/{x}/{y}.png';
let aspmadRegionLayerDisplayed = false;
let flcRegionLayerDisplayed = false;

// Default zoom, center and rotation

let zoom = 9.8;
let center = [6.611754907101035, 46.599721956140044];
let rotation = 0;

// Initialize features

const locationsFeatures = [];

// Retrieve URL parameters

let urlParams = null;
if (window.location.search != null) {
  urlParams = new URLSearchParams(window.location.search);
}

// Set values from URL parameters

if (urlParams != null) {
  // Map
  const mapParam = urlParams.get('map');
  if (mapParam != null) {
    let mapValues = mapParam.split(sep);
    if (mapValues != null && mapValues.length == 4) {
      zoom = parseFloat(mapValues[0]);
      center = [parseFloat(mapValues[1]), parseFloat(mapValues[2])];
      rotation = parseFloat(mapValues[3]);
    }
  }
}

// Initialize locations
  
const locationsParam = urlParams.get('locations');
if (locationsParam != null) {
  let locationsValues = locationsParam.split(sep);
  for (const locationValues of locationsValues) {
    let locValues = locationValues.split(',');
    if (locValues != null && locValues.length == 4) {
      let locationFeature = new Feature({
        geometry: new Point(fromLonLat([locValues[0],locValues[1]]))
      });
      let style = new Style({
        image: new Icon({
          src: `data/images/${locValues[2]}.png`,
          scale: 0.1,

        }),
        text: new Text({
          text: locValues[3],
          font: '16px sans-serif',
          textAlign: 'center',
          fill: new Fill({
            color: [63, 63, 63, 1]
          }),
          stroke: new Stroke({
            color: [255, 255, 255, 0.8],
            width: 4
          }),
          offsetY: 30
        })
      });
      locationFeature.setStyle(style);
      locationsFeatures.push(locationFeature);
    }
  }
}

// Initialize layers

const avasadMapLayer = new TileLayer({
  source: new OSM({
    url: osmTileServerURL,
    format: 'image/png',
    crossOrigin: null,
    attributions: [
      `© ${new Date().getFullYear()} <a href="https://www.cms-vaud.ch">AVASAD</a>`,
      '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    ]
  })
});

const aspmadRegionLayer = new VectorLayer({
  source: new VectorSource({
    url: 'data/ASPMAD.kml',
    format: new KML()
  }),
  opacity: 0.5
});

const flcRegionLayer = new VectorLayer({
  source: new VectorSource({
    url: 'data/FLC.kml',
    format: new KML()
  }),
  opacity: 0.5
});

const locationsLayer = new VectorLayer({
  source: new VectorSource({
    features: locationsFeatures
  })
});

// Display map

const map = new Map({
  layers: [avasadMapLayer, aspmadRegionLayer, flcRegionLayer, locationsLayer],
  target: 'map',
  view: new View({
    center: fromLonLat(center),
    zoom: zoom,
    rotation: rotation
  })
});

// Permalink handling

let shouldUpdate = true;
const updatePermalink = function () {
  if (!shouldUpdate) {
    // Do not update the URL when the view was changed in the 'popstate' handler
    shouldUpdate = true;
    return;
  }
  const view = map.getView();
  const center = toLonLat(view.getCenter());
  const mapParam =
    view.getZoom().toFixed(2) + sep +
    center[0].toFixed(15) + sep +
    center[1].toFixed(15) + sep +
    view.getRotation();
  const state = {
    zoom: view.getZoom(),
    center: toLonLat(view.getCenter()),
    rotation: view.getRotation(),
  };
  let params = '?map=' + mapParam;
  if (urlParams != null) {
    const locationsParam = urlParams.get('locations');
    if (locationsParam != null) {
      params = params + '&locations=' + locationsParam;
    }
  }
  window.history.pushState(state, 'map', params);
}

map.on('moveend', updatePermalink);

// Restore the view state when navigating through the history, see
// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
window.addEventListener('popstate', function (event) {
  if (event.state == null) {
    return;
  }
  map.getView().setCenter(fromLonLat(event.state.center));
  map.getView().setZoom(event.state.zoom);
  map.getView().setRotation(event.state.rotation);
  shouldUpdate = false;
});

// Toggles for regions

const toggleRegionDisplay = function(evt){
  const button = evt.srcElement;
  const id = button.id;
  if ('aspmad' == id) {
    aspmadRegionLayerDisplayed = applyToggle(aspmadRegionLayerDisplayed, aspmadRegionLayer, button);
  } else if ('flc' == id) {
    flcRegionLayerDisplayed = applyToggle(flcRegionLayerDisplayed, flcRegionLayer, button);
  }
}

const applyToggle = function(regionLayerDisplayed, regionLayer, button) {
  if (regionLayerDisplayed) {
    regionLayer.setVisible(false);
    regionLayerDisplayed = false;
    button.style.backgroundColor = 'white';
  } else {
    regionLayer.setVisible(true);
    regionLayerDisplayed = true;
    button.style.backgroundColor = '#ffe7cc';
  }
  return regionLayerDisplayed;
}

aspmadRegionLayer.setVisible(false);
flcRegionLayer.setVisible(false);

document.getElementById('aspmad').addEventListener('click', toggleRegionDisplay);
document.getElementById('flc').addEventListener('click', toggleRegionDisplay);
