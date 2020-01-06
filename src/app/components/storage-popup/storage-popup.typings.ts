import { Storage } from '../../models/storage';
import { Line, VirtualLine } from '../../models/line';
import { PopupNodeInfo } from '../map/map.typings';

export interface StoragePopupResult {
  nodeId: string;
  storage: Storage;
  line?: VirtualLine;
  deleteStorage?: boolean;
}

export interface StoragePopupInputData {
  node: PopupNodeInfo;
  storage: Storage;
}

export interface BatteryModel {
  storage_capacity: number;
  nominal_charging_power: number;
  nominal_discharging_power: number;
  battery_technology: 'LiFePO4';
  dimension: '955 x 570 x 611 mm';
  weight: 91 | 108 | 125 | 142 | 159 | 176;
  cost: number;
}

export type BatteryModels = {
  [key: string]: BatteryModel;
};

export interface OperationalMode {
  lifetime: number;
}

export type OperationalModes = {
  [key: string]: OperationalMode;
};
