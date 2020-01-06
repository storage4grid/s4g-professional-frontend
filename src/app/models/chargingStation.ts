export interface ChargingStation {
  tech_id: string;
  category: 'charging_station';
  id: string;
  bus1: string;
  charging_efficiency: number;
  hosted_ev: EV[];
  kV: number;
  max_charging_power_kW: number;
  phases: number;
  powerfactor: number;
  type_application: string;
  latitudine?: number;
  longitudine?: number;
  model: string;
}

export interface EV {
  id: string;
  SoC: number;
  battery_capacity_kWh: number;
  consumption_in_kW_pro_100_km: number;
  unit_consumption_assumption: number;
  unit_drop_penalty: number;
  model: string;
}

export interface ChargingStations {
  [key: string]: ChargingStation;
}
