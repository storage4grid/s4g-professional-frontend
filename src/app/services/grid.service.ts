import { Injectable } from '@angular/core';

// ******** Models *********

import { Nodes, Node } from '../models/node';
import { Lines } from '../models/line';
import { Linecodes } from '../models/linecode';
import { Transformers } from '../models/transformer';

// ******** Helpers *********
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL, seURL, AppSettings, eeURL, professURL } from '../app-config';

import {
  Observable,
  of,
  forkJoin,
  throwError,
  combineLatest,
  interval,
  timer
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  zip,
  concatMap,
  takeWhile,
  take,
  concatAll,
  endWith,
  retryWhen,
  mergeMap,
  finalize,
  delay
} from 'rxjs/operators';
import { Grid, GridElements } from '../models/grid';
import { SimulationResult, ResponseMessage } from '../models/simulationResult';
import { SimulationParameters } from '../models/simulationParameters';
import * as shortid from 'shortid';
import * as _ from 'lodash';
import {
  EconomicEngineRequest,
  EssInformation,
  EconomicEngineResponse
} from '../models/economicEngine';
import * as moment from 'moment';
import { PowerProfile } from '../models/powerProfiles';

export const genericRetryStrategy = ({
  maxRetryAttempts = 3,
  scalingDuration = 1000,
  excludedStatusCodes = []
}: {
  maxRetryAttempts?: number;
  scalingDuration?: number;
  excludedStatusCodes?: number[];
} = {}) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      // if maximum number of retries have been met
      // or response is a status code we don't wish to retry, throw error
      if (
        retryAttempt > maxRetryAttempts ||
        excludedStatusCodes.find(e => e === error.status)
      ) {
        return throwError(error);
      }
      console.log(
        `Attempt ${retryAttempt}: retrying in ${retryAttempt *
          scalingDuration}ms`
      );
      // retry after 1s, 2s, etc...
      return timer(retryAttempt * scalingDuration);
    }),
    finalize(() => console.log('We are done!'))
  );
};

/**
 * Handles the grid data and the connection to the gridDB
 */
@Injectable()
export class GridService {
  /**
   * Default location from where the grid data will be accessed
   */
  defaultLocation = localStorage.getItem('defaultLocation') || 'fur';

  /**
   * GeoJSON with the grid data
   */
  geoJSON: any = [];
  powerProfiles: PowerProfile[] = [
    {
      id: 'pv_profile',
      normalized: true,
      items: [
        0.0,
        0.0,
        0.0,
        0.06444,
        0.23944,
        0.28816,
        0.67244,
        0.33556,
        1.8096,
        2.61676,
        2.66788,
        2.3658,
        3.13448,
        2.45992,
        1.83236,
        1.33724,
        0.5062,
        0.11924,
        0.06052,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.07144,
        0.1206,
        0.17912,
        0.03784,
        0.47624,
        0.69744,
        0.48372,
        0.9396,
        1.46204,
        1.57848,
        2.032,
        1.7696,
        0.90028,
        0.518,
        0.15448,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
      ],
      interval: 1,
      multiplier: 1
    }
  ];

  constructor(private http: HttpClient) {}

  getGrid(location: string): Observable<Nodes> {
    const url = `${URL[location]}/nodes`;

    return this.http
      .get<Nodes>(url)
      .pipe(catchError(this.handleError<Nodes>('getGrid')));
  }

  getLines(location: string): Observable<Lines> {
    const url = `${URL[location]}/lines`;

    return this.http
      .get<Lines>(url)
      .pipe(catchError(this.handleError<Lines>('getLines')));
  }

  getLineCodes(location: string): Observable<Linecodes> {
    const url = `${URL[location]}/linecodes`;

    return this.http
      .get<Linecodes>(url)
      .pipe(catchError(this.handleError<Linecodes>('getLineCodes')));
  }

  getTransformers(location: string): Observable<Transformers> {
    const url = `${URL[location]}/transformers`;

    return this.http
      .get<Transformers>(url)
      .pipe(catchError(this.handleError<Transformers>('getTransformers')));
  }

  getGridData(location: string) {
    const gridObserver = this.getGrid(location);
    const lineObserver = this.getLines(location);
    const linecodeObserver = this.getLineCodes(location);
    const transformerObserver = this.getTransformers(location);

    return forkJoin([
      gridObserver,
      lineObserver,
      linecodeObserver,
      transformerObserver
    ]);
  }

  startSimulation(
    grid: Grid,
    gridElements: GridElements,
    parameters: SimulationParameters
  ): Observable<any> {
    const { loads, transformers, storages, pvs, chargingStations } = grid;
    const { lines, linecodes } = gridElements;

    const { loadProfile } = parameters;
    const city = loadProfile.toLowerCase();
    const { country } = AppSettings.LOCATIONS[city];

    const voltageBases = _.uniq(
      _.flatten(
        Object.values(grid.transformers).map(transformer => [
          parseFloat(transformer.kv1),
          parseFloat(transformer.kv2)
        ])
      )
    );

    const simulationGrid = {
      common: {
        id: shortid.generate(),
        base_kV: 10,
        per_unit: 1.05,
        phases: 3,
        bus1: Object.values(transformers)[0].bus1,
        angle: 30,
        MVAsc3: 20000,
        MVAsc1: 21000,
        VoltageBases: voltageBases,
        base_frequency: 60,
        url_storage_controller: professURL,
        max_reactive_power_in_kVar_to_grid: 6,
        max_real_power_in_kW_to_grid: 6,
        city: city,
        country: country
      },
      radials: [
        {
          transformer: [],
          loads: [],
          powerProfiles: this.powerProfiles,
          powerLines: [],
          photovoltaics: [],
          storageUnits: [],
          chargingStations: []
          // linecode: []
          // capacitor: [],
          // voltage_regulator: [],
          // xycurves: [],
          // loadshapes: [],
          // tshapes: []
        }
      ]
    };

    simulationGrid.radials[0].transformer = Object.values(transformers).map(
      currentTransformer => ({
        id: currentTransformer.tech_id,
        phases: currentTransformer.phases,
        windings: parseInt(currentTransformer.windings, 0),
        buses: [currentTransformer.bus1, currentTransformer.bus2],
        kvas: [
          parseFloat(currentTransformer.kva1),
          parseFloat(currentTransformer.kva2)
        ],
        kvs: [
          parseFloat(currentTransformer.kv1),
          parseFloat(currentTransformer.kv2)
        ],
        conns: [currentTransformer.conn1, currentTransformer.conn2],
        xsc_array: [0.008],
        percent_rs: [0.0005, 0.0005],
        percent_load_loss: 0.001,
        taps: [1, 1],
        base_frequency: 60
      })
    );

    simulationGrid.radials[0].loads = Object.values(loads).map(
      (load, index) => ({
        id: load.tech_id,
        bus: load.bus1,
        phases: load.phases,
        connection_type: load.conn,
        kV: load.kV,
        kW: load.kW,
        powerfactor: load.pf,
        power_profile_id: `profile_${index + 1}`
      })
    );

    const realPowerLines = Object.values(lines).map(line => ({
      id: line.tech_id,
      phases: line.phases,
      bus1: line.bus1,
      bus2: line.bus2,
      length: line.length,
      r1: linecodes[line.linecode].R1,
      x1: linecodes[line.linecode].X1,
      c0: linecodes[line.linecode].C0,
      unitlength: linecodes[line.linecode].Units
    }));

    simulationGrid.radials[0].powerLines = [...realPowerLines];

    // simulationGrid.radials[0].powerLines = [...]

    const optimizationModelMapping = {
      'Minimize Costs': 'MinimizeCosts',
      'Maximize Self-Consumption': 'Maximize Self-Consumption',
      'Support of Voltage Regulation': 'Maximize Self-Production',
      'EV support': 'Maximize Self-Consumption'
    };

    simulationGrid.radials[0].storageUnits = Object.values(storages).map(
      storage => ({
        id: storage.id,
        bus1: storage.bus1,
        phases: storage.phases,
        soc: storage.soc,
        min_soc: storage.min_soc,
        max_soc: storage.max_soc,
        kv: storage.kV,
        max_charging_power: storage.max_charging_power,
        max_discharging_power: storage.max_discharging_power,
        storage_capacity: storage.storage_capacity,
        optimization_model: optimizationModelMapping[storage.operationalMode],
        powerfactor: storage.powerfactor,
        global_control: storage.global_control
      })
    );

    simulationGrid.radials[0].photovoltaics = Object.values(pvs).map(pv => ({
      bus1: pv.bus1,
      id: pv.tech_id,
      max_power_kW: 'max_power_kW' in pv ? pv.max_power_kW : pv.kVA,
      phases: pv.phases,
      power_profile_id: _.sample(
        this.powerProfiles.map((profile: PowerProfile) => profile.id)
      ),
      control_strategy: 'ofw',
      kV: pv.kV
    }));

    simulationGrid.radials[0].chargingStations = Object.values(
      chargingStations
    ).map(chargingStation => ({
      id: chargingStation.id,
      bus: chargingStation.bus1,
      phases: chargingStation.phases,
      kV: chargingStation.kV,
      max_charging_power_kW: chargingStation.max_charging_power_kW,
      charging_efficiency: chargingStation.charging_efficiency,
      powerfactor: chargingStation.powerfactor,
      type_application: chargingStation.type_application,
      hosted_ev: chargingStation.hosted_ev
    }));

    const essInformation: EssInformation[] = Object.values(storages).map(
      storage => ({
        kwh: storage.kwh,
        lifetime: storage.lifetime,
        location: 'household'
      })
    );

    const simulationConfig = {
      sim_duration_in_hours: parameters.duration
    };

    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const options = {
      headers
    };

    const economicEngineRequest = (
      kwp: number,
      kwh_losses: number
    ): EconomicEngineRequest => ({
      simulation_id: Math.floor(Math.random() * 10),
      grid_name: city,
      kwp: kwp,
      kwh_losses: kwh_losses,
      // If simulation time = 0 then 1. Else rounded to nearest int
      simulation_time:
        Math.round(moment.duration(parameters.duration, 'hours').asYears()) ||
        1,
      ESS_info: essInformation
    });

    const getSimulationID: Observable<string> = this.http
      .post<string>(`${seURL}/simulation`, simulationGrid)
      .pipe(catchError(this.handleError<string>('getSimulationID', 'error')));

    const startSimulation = (
      simulationID: string
    ): Observable<ResponseMessage> =>
      this.http
        .put<string>(`${seURL}/commands/run/${simulationID}`, simulationConfig)
        .pipe(
          retryWhen(
            genericRetryStrategy({
              maxRetryAttempts: 4,
              scalingDuration: 1000
            })
          ),
          catchError(this.handleError<string>('startSimulation', 'error'))
        )
        .pipe(map((info: string) => ({ from: 'startSimulation', info })));

    const getStatus = (simulationID: string): Observable<number> =>
      this.http.get<number>(`${seURL}/commands/status/${simulationID}`).pipe(
        retryWhen(
          genericRetryStrategy({
            maxRetryAttempts: 12,
            scalingDuration: 500
          })
        ),
        catchError(this.handleError<number>('getStatus', -1))
      );

    const getSimulationStatus = (
      simulationID: string
    ): Observable<ResponseMessage> =>
      timer(0, 500)
        .pipe(concatMap(() => getStatus(simulationID)))
        .pipe(
          map((status: number) => ({ from: 'getSimulationStatus', status }))
        )
        .pipe(
          takeWhile(
            ({ status }: ResponseMessage) => status < 100 && status !== -1
          ),
          endWith({ from: 'getSimulationStatus', status: 100 }),
          delay(3000)
        );

    const getResults = (simulationID: string): Observable<ResponseMessage> =>
      this.http
        .get<SimulationResult>(`${seURL}/simulation/${simulationID}`)
        .pipe(
          retryWhen(
            genericRetryStrategy({
              maxRetryAttempts: 4,
              scalingDuration: 1000
            })
          ),
          catchError(
            this.handleError<SimulationResult>('getResults', Object.assign({}))
          )
        )
        .pipe(
          switchMap(
            (result: SimulationResult) => {
              const kwp = Object.values(result.powers.Transformer)[0];
              const kwh_losses = result.losses['circuit_total_losses'];

              const eeRequest: EconomicEngineRequest = economicEngineRequest(
                kwp,
                kwh_losses
              );

              return this.http
                .post<EconomicEngineResponse>(eeURL, eeRequest, options)
                .pipe(
                  catchError(
                    this.handleError<EconomicEngineResponse>(
                      'getEconomicEngineResults',
                      Object.assign({})
                    )
                  )
                );
            },
            (seResult: SimulationResult, eeResult: EconomicEngineResponse) => ({
              ...seResult,
              economicEngine: eeResult
            })
          ),
          map((result: SimulationResult) => {
            return {
              from: 'getResults',
              result
            };
          })
        );

    const runSimulation = getSimulationID
      .pipe(
        concatMap((simulationID: string) =>
          timer(0, 2000).pipe(
            take(4),
            map(
              i =>
                [
                  of({
                    from: 'getSimulationID',
                    simulationID
                  }),
                  startSimulation(simulationID),
                  getSimulationStatus(simulationID),
                  getResults(simulationID)
                ][i]
            )
          )
        )
      )
      .pipe(concatAll());

    return runSimulation;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead

      console.warn(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
