export interface Load {
  tech_id: string;
  latitudine?: number;
  longitudine?: number;
  phases: number;
  bus1: string;
  feeder: string;
  kV: number;
  kW: number;
  pf: number;
  conn: string;
  model: number;
  category: string;
  monitor: { state: string; var: string[] };
}

export interface Loads {
  [key: string]: Load;
}
