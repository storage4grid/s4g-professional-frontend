export interface Line {
  tech_id: string;
  bus1: string;
  bus2: string;
  linecode: string;
  phases: number;
  length: number;
  monitor: {
    state: string;
    var: string[];
  };
}

export interface VirtualLine {
  tech_id: string;
  bus1: string;
  bus2: string;
  realBus: string;
  linecode: string;
  phases: number;
  length: number;
}

export interface Lines {
  [key: string]: Line;
}

export interface VirtualLines {
  [key: string]: VirtualLine;
}
