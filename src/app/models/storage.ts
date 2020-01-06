export interface Storage {
  id: string;
  tech_id: string;
  latitudine?: number;
  longitudine?: number;
  category: 'storage';
  bus1: string;
  phases: number;
  soc: number;
  min_soc: number;
  max_soc: number;
  kwh: number;
  kV: number;
  max_charging_power: number;
  max_discharging_power: number;
  powerfactor: number;
  cost: number;
  model: string;
  storage_capacity: number;
  operationalMode: string;
  lifetime: number;
  global_control: boolean;
}

export interface Storages {
  [key: string]: Storage;
}
