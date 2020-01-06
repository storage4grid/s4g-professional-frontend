import * as L from 'leaflet';

import { Icons } from './map.typings';
import { statusColorHex } from './util';
import { Diff } from '../../utils/typings';

export type Labels = 'transformer' | 'house' | 'pv' | 'ev' | 'storage';
export type IconNames = 'Transformer' | 'House' | 'PV' | 'EV' | 'Storage';
export type IconStatus = 'ready' | 'selected' | 'error' | 'success';

export const iconTypes: Labels[] = [
  'transformer',
  'house',
  'pv',
  'ev',
  'storage'
];

export const iconStatus: (Diff<IconStatus, 'ready'> | '')[] = [
  '',
  'selected',
  'error',
  'success'
];

export const iconLabels: string[] = iconTypes.reduce(
  (prev, curr) => [...prev, ...iconStatus.map(status => `${curr}${status}`)],
  []
);

export const icons: Icons = iconLabels.reduce(
  (obj: Icons, label: Labels) => ({
    ...obj,
    [label]: `assets/images/${label}.svg`
  }),
  {}
);

export const createIcon = (
  label: Labels,
  status: IconStatus,
  iconSize: number[] = [24, 24]
) => {
  const [x, y] = iconSize;
  return L.icon({
    iconUrl:
      status === 'ready' ? icons[`${label}`] : icons[`${label}${status}`],
    iconSize: [x, y],
    iconAnchor: [x / 2, y / 2],
    popupAnchor: [0, -y / 2],
    tooltipAnchor: [x / 2, 0]
  });
};

export const iconMarker = (
  label: Labels,
  coordinate: L.LatLngExpression,
  status: IconStatus,
  iconSize: number[] = [24, 24]
) => {
  return L.marker(coordinate, {
    icon: createIcon(label, status, iconSize)
  });
};

export const nodeMarker = (
  coordinate: L.LatLngExpression,
  status: IconStatus
): L.CircleMarker => {
  return L.circleMarker(coordinate, {
    radius: 6,
    fillColor: statusColorHex(status),
    color: status === 'ready' ? '#000' : statusColorHex(status),
    weight: 1,
    opacity: 1,
    fillOpacity: 1
  });
};
