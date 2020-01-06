import * as L from 'leaflet';

import { IconStatus } from './map.icons';
import { Node, Nodes } from '../../models/node';
import { PV, PVs } from '../../models/pv';
import {
  ChargingStations,
  ChargingStation
} from '../../models/chargingStation';
import { Storage, Storages } from '../../models/storage';
import { Transformer, Transformers } from '../../models/transformer';

export type PopUpElement = Storage | PV | ChargingStation;
export type PopUpElements = Storages | PVs | ChargingStations;

export type MarkerElement = Node | Transformer | PopUpElement;
export type MarkerElements = Nodes | Transformers | PopUpElements;

export interface VirtualNodeLayer {
  [key: string]: L.CircleMarker;
}

export interface MarkerLayer {
  [key: string]: L.Marker;
}

export interface LineLayer {
  [key: string]: L.Polyline;
}

export interface GridElementsLayer {
  lineLayer: LineLayer;
  virtualLineLayer: LineLayer;
}

export interface GridLayer {
  nodeLayer: MarkerLayer;
  virtualNodeLayer: VirtualNodeLayer;
  pvLayer: MarkerLayer;
  storageLayer: MarkerLayer;
  transformerLayer: MarkerLayer;
  chargingStationLayer: MarkerLayer;
}

export interface Icons {
  [key: string]: string;
}

export type SimulationStatus =
  | ''
  | 'selected'
  | 'running'
  | 'complete'
  | 'error';

export interface PopupConfig<T> {
  width: string;
  maxWidth: string;
  data: T;
}

export type GridStatus = {
  nodeStatus: IconStatus;
  pvStatus: IconStatus;
  chargingStationStatus: IconStatus;
  storageStatus: IconStatus;
  transformerStatus: IconStatus;
  lineStatus: IconStatus;
};

export interface PopupNodeInfo {
  tech_id: string;
  phases: number;
  kV: number;
  buses: string[];
}
