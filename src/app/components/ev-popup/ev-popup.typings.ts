import { Line, VirtualLine } from '../../models/line';
import { ChargingStation } from '../../models/chargingStation';
import { PopupNodeInfo } from '../map/map.typings';

export interface ChargingStationModel {
  max_charging_power_kW: number;
  charging_efficiency: number;
}

export interface ChargingStationModels {
  [key: string]: ChargingStationModel;
}

export interface EvModel {
  battery_capacity_kWh: number;
  consumption_in_kW_pro_100_km: number;
}

export interface EvModels {
  [key: string]: EvModel;
}

export interface EvPopupResult {
  nodeId: string;
  chargingStation: ChargingStation;
  line?: VirtualLine;
  deleteChargingStation?: boolean;
}

export interface EvPopupInputData {
  node: PopupNodeInfo;
  chargingStation: ChargingStation;
}
