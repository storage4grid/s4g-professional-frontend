export interface Linecode {
  C0: number;
  R1: number;
  Units: string;
  X1: number;
  max_current: number;
  tech_id: string;
}

export interface Linecodes {
  [key: string]: Linecode;
}
