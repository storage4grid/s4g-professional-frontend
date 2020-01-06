export interface PV {
  tech_id: string;
  latitudine?: number;
  longitudine?: number;
  bus1: string;
  phases: number;
  PF: number;
  kV: number;
  kVA: number;
  effcurve?: string;
  'P-TCurve'?: string;
  Daily?: string;
  TDaily?: string;
  monitor?: { state: string; var: string[] };
  id?: string;
  max_power_kW?: number;
  category: 'pv';
}

export interface PVs {
  [key: string]: PV;
}
