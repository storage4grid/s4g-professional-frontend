// ******** Angular Modules *********
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Host,
  Input
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { DbService } from '../../services/db.service';
import * as moment from 'moment';
import {
  LoadProfile,
  PenetrationLevel,
  SimulationParameters
} from '../../models/simulationParameters';
import { EconomicEngineResponse } from '../../models/economicEngine';
import { SimulationStatus } from '../map/map.typings';
import { availableStorageOperationalModes } from '../storage-popup/storage-models';
import { OperationalModes } from '../storage-popup/storage-popup.typings';

/**
 * Widget for configuring and starting the simulation and displaying simulation results
 */
@Component({
  selector: 'app-simulation-widget',
  templateUrl: './simulation-widget.component.html',
  styleUrls: ['simulation-widget.component.scss']
})
export class SimulationWidgetComponent implements OnInit {
  /**
   * The duration that should be simulated
   */
  duration = {
    days: 0,
    months: 0,
    years: 0
  };

  loadProfileMapping = {
    'Database Denmark': 'fur',
    'Database Italy': 'bolzano'
  };

  loadProfileNames = ['Database Denmark', 'Database Italy'];
  loadProfileName: LoadProfile = this.loadProfileNames[0];

  runningSimulation = false;

  /**
   * Shows if there are simulation results to display
   */
  @Input() simulationStatus: SimulationStatus;
  @Input() simulationErrorMessage: string;

  /**
   * Counter for the number of nodes with an error for one simulation
   */
  @Input() errorCount: number;

  @Input() uri: any;

  @Input() simulationID: string;
  @Input() simulationStarted: boolean;
  @Input() currentSimulationStatus: number;
  @Input() economicEngineResponse: EconomicEngineResponse;
  @Input() totalLoadPower: string;
  @Input() totalPvPower: string;

  /**
   * Numerical value for the duration that should be simulated
   */
  durationValue: number;

  /**
   * Unit for the duration that should be simulated (days, months, years)
   */
  durationUnit: string;

  penetrationLevel: PenetrationLevel = {
    pv: 10,
    ev: 20,
    storage: 30
  };

  /**
   * Dialog shwon while the simulation is running
   */
  simulationStatusDialog: any;

  simulationHistory: any = [];

  gridData: any;

  simulationDuration: number;

  economicModelSimulationDuration: number = 20;

  pvPenetrationEnabled: boolean = false;
  evPenetrationEnabled: boolean = false;
  storagePenetrationEnabled: boolean = false;

  operationalModes: OperationalModes = availableStorageOperationalModes;
  operationalMode: string = 'Random';
  objectKeys = Object.keys;

  /**
   * EventEmitter to notify the parent component (in this case map.component)
   * that the simulation has ended and has results
   */
  @Output() startSimulation = new EventEmitter<any>();
  @Output() loadSimulation = new EventEmitter<any>();
  @Output() setPvPenetrationLevel = new EventEmitter<any>();
  @Output() setChargingStationPenetrationLevel = new EventEmitter<any>();
  @Output() setStoragePenetrationLevel = new EventEmitter<any>();

  constructor(
    private dbService: DbService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    // preselection of most recent values
    this.durationUnit = 'days';
    this.durationValue = 2;
    this.setDuration(this.durationValue, this.durationUnit);
  }

  isNotEmpty(obj: any) {
    return !(obj && Object.keys(obj).length === 0);
  }

  getDurationInYears(value: number, unit: 'days' | 'months' | 'years') {
    const duration = moment.duration(value, unit);
    return Math.floor(duration.asYears()) || 1;
  }

  ngOnInit(): void {
    this.dbService.fetchSimulations().subscribe(simulations => {
      this.simulationHistory = simulations.map(simulation => ({
        id: simulation.id,
        location: simulation.location,
        timestamp: moment(simulation.timestamp).fromNow()
      }));
    });
  }

  togglePvPenetration(state) {
    const { checked } = state;

    this.setPvPenetrationLevel.emit({
      state: checked,
      penetrationLevel: this.penetrationLevel.pv,
      backup: true
    });
  }

  updatePvPenetration() {
    this.setPvPenetrationLevel.emit({
      state: true,
      penetrationLevel: this.penetrationLevel.pv,
      backup: false
    });
  }

  toggleChargingStationPenetration(state) {
    const { checked } = state;

    this.setChargingStationPenetrationLevel.emit({
      state: checked,
      penetrationLevel: this.penetrationLevel.ev,
      backup: true
    });
  }

  updateChargingStationPenetration() {
    this.setChargingStationPenetrationLevel.emit({
      state: true,
      penetrationLevel: this.penetrationLevel.ev,
      backup: false
    });
  }

  toggleStoragePenetration(state) {
    const { checked } = state;

    this.setStoragePenetrationLevel.emit({
      state: checked,
      penetrationLevel: this.penetrationLevel.storage,
      backup: true,
      operationalMode: this.operationalMode
    });
  }

  updateStoragePenetration() {
    this.setStoragePenetrationLevel.emit({
      state: true,
      penetrationLevel: this.penetrationLevel.storage,
      backup: false,
      operationalMode: this.operationalMode
    });
  }

  generateExport(simulation: any) {
    const exportGrid = JSON.stringify(simulation, undefined, 2);
    this.gridData = this.sanitizer.bypassSecurityTrustUrl(
      'data:text/json;charset=UTF-8,' + encodeURIComponent(exportGrid)
    );
  }

  choosePreviousSimulation(id: string) {
    const simulation = this.dbService.fetchSimulation(id);
    this.loadSimulation.emit(simulation);

    const { parameters } = simulation;

    this.penetrationLevel = parameters.penetrationLevel;
    this.duration = parameters.durationState;

    Object.entries(this.duration).forEach(([key, value]) => {
      if (value !== 0) {
        this.durationUnit = key;
        this.durationValue = value;
      }
    });

    Object.entries(this.loadProfileMapping).forEach(([key, value]) => {
      if (value === parameters.loadProfile) {
        this.loadProfileName = key;
      }
    });

    this.generateExport(simulation);
  }

  /**
   * Set the duration
   * @param value The value for the duration
   * @param unit The unit (days, months, years) for the duration
   */
  setDuration(value, unit) {
    // catch empty fields and such
    if (value === '' || unit === '') {
      this.duration = {
        days: 0,
        months: 0,
        years: 0
      };
    } else {
      if (unit === 'days') {
        this.duration.days = parseInt(value, 10);
        this.duration.months = 0;
        this.duration.years = 0;
      } else if (unit === 'months') {
        this.duration.months = parseInt(value, 10);
        this.duration.days = 0;
        this.duration.years = 0;
      } else if (unit === 'years') {
        this.duration.years = parseInt(value, 10);
        this.duration.days = 0;
        this.duration.months = 0;
      }

      const duration = moment.duration(value, unit);
      this.simulationDuration = duration.asHours();
    }
  }

  /**
   * Check if the user has supplied a duration
   * @returns true if no duration value for either days, months or years has been set
   */
  hasNoDuration(): boolean {
    return (
      this.duration.days === 0 &&
      this.duration.months === 0 &&
      this.duration.years === 0
    );
  }

  runSim() {
    const city = this.loadProfileMapping[this.loadProfileName];

    this.simulationID = null;

    if (
      this.simulationDuration &&
      this.penetrationLevel &&
      this.loadProfileName
    ) {
      const parameters: SimulationParameters = {
        duration: this.simulationDuration,
        durationState: this.duration,
        penetrationLevel: this.penetrationLevel,
        loadProfile: city
      };

      this.startSimulation.emit(parameters);
    }
  }
}
