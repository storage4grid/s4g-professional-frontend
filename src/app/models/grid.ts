import { Nodes } from './node';
import { Loads } from './load';
import { PVs } from './pv';
import { Storages } from './storage';
import { Transformers } from './transformer';
import { Lines, VirtualLines } from './line';
import { Linecodes } from './linecode';
import { ChargingStations } from './chargingStation';

export interface GridElements {
  lines: Lines;
  virtualLines: VirtualLines;
  linecodes: Linecodes;
}

export interface Grid {
  nodes: Nodes;
  virtualNodes: Nodes;
  loads: Loads;
  pvs: PVs;
  storages: Storages;
  transformers: Transformers;
  chargingStations: ChargingStations;
}
