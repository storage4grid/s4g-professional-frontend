import * as L from 'leaflet';

import { Load, Loads } from './load';
import { PV, PVs } from './pv';
import { Storage, Storages } from './storage';
import { ChargingStation, ChargingStations } from './chargingStation';

export interface Node {
  tech_id: string;
  latitudine: number;
  longitudine: number;
  feeder: string;
  connected_elements: ConnectedElements;
}

export interface VirtualNode {
  tech_id: string;
  latitudine: number;
  longitudine: number;
  feeder: string;
  connected_elements: {};
}

export interface VirtualNodes {
  [key: string]: VirtualNode;
}

export interface Nodes {
  [key: string]: Node;
}

export type NodeElement = Load | Storage | PV | ChargingStation;
export type NodeElements = Loads | Storages | PVs | ChargingStations;

export interface ConnectedElements {
  [key: string]: NodeElement;
}

export interface ConnectedElement {
  tech_id: string;
  coordinate: L.LatLngExpression;
  elements: NodeElement[];
}
