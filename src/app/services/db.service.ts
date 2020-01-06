import { Injectable } from '@angular/core';
import { Grid, GridElements } from '../models/grid';
import { SimulationResult } from '../models/simulation/models';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import * as _ from 'lodash';
import {
  DbSchema,
  SimulationIdentifiers,
  Simulation,
  IGrid
} from './db.typings';
import { SimulationParameters } from '../models/simulationParameters';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  simulations: BehaviorSubject<DbSchema>;

  constructor() {
    const schema: DbSchema = JSON.parse(localStorage.getItem('prof_gui')) || {
      simulations: []
    };

    this.simulations = new BehaviorSubject<DbSchema>(schema);
    localStorage.removeItem('grid_bkp');
  }

  backupGrid(grid: Grid, gridElements: GridElements) {
    const gridBkp: IGrid = {
      grid,
      gridElements
    };

    localStorage.setItem('grid_bkp', JSON.stringify(gridBkp));
  }

  restoreGrid(): IGrid {
    const gridBkp: IGrid = JSON.parse(localStorage.getItem('grid_bkp'));

    localStorage.removeItem('grid_bkp');

    return gridBkp;
  }

  storeGrid(
    id: string,
    location: string,
    grid: Grid,
    gridElements: GridElements,
    simulationResult: SimulationResult,
    parameters: SimulationParameters
  ) {
    const schema: DbSchema = JSON.parse(localStorage.getItem('prof_gui')) || {
      simulations: []
    };

    schema.simulations.push({
      id,
      location,
      timestamp: Date.now(),
      grid,
      gridElements,
      simulationResult,
      parameters
    });

    localStorage.setItem('prof_gui', JSON.stringify(schema));

    this.simulations.next(schema);
  }

  fetchSimulations(): Observable<SimulationIdentifiers[]> {
    return this.simulations.pipe<SimulationIdentifiers[]>(
      map<DbSchema, SimulationIdentifiers[]>((schema: DbSchema) =>
        schema.simulations
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((simulation: Simulation) => ({
            id: simulation.id,
            location: simulation.location,
            timestamp: simulation.timestamp
          }))
      )
    );
  }

  fetchSimulation(id: string): Simulation {
    const schema: DbSchema = JSON.parse(localStorage.getItem('prof_gui')) || {
      simulations: []
    };

    return schema.simulations.find(simulation => simulation.id === id);
  }
}
