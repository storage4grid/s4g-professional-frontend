import { Grid, GridElements } from '../models/grid';
import { SimulationResult } from '../models/simulation/models';
import { SimulationParameters } from '../models/simulationParameters';

export interface SimulationIdentifiers {
  id: string;
  location: string;
  timestamp: number;
}

export type IGrid = {
  grid: Grid;
  gridElements: GridElements;
};

export interface Simulation extends SimulationIdentifiers {
  grid: Grid;
  gridElements: GridElements;
  simulationResult: SimulationResult;
  parameters: SimulationParameters;
}

export interface DbSchema {
  simulations: Simulation[];
}
