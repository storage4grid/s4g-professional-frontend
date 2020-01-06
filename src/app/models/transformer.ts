export interface Transformer {
  bus1: string;
  bus2: string;
  latitudine: number;
  longitudine: number;
  conn1: string;
  conn2: string;
  kv1: string;
  kv2: string;
  kva1: string;
  kva2: string;
  monitor: {
    state: string;
    var: string[];
  };
  phases: number;
  r1: number;
  r2: number;
  substation: string;
  tech_id: string;
  windings: string;
  xhl: number;
}

export interface Transformers {
  [key: string]: Transformer;
}
