import * as L from 'leaflet';
import 'leaflet.markercluster';

import { AppSettings } from '../../app-config';

/* Leaflet Map options */

const ZOOM = 17;

export const leafletOptions = {
  layers: [
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Open Street Map',
      minZoom: ZOOM - 2,
      maxZoom: 19
    })
  ],
  zoom: ZOOM,

  center: L.latLng(AppSettings.INITIAL_COORDS)
};

export const markerClusterOptions: L.MarkerClusterGroupOptions = {
  animateAddingMarkers: true,
  maxClusterRadius: 15,
  spiderfyDistanceMultiplier: 12
};
