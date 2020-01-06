import * as shortid from 'shortid';
import { PV } from '../models/pv';
import { Line, VirtualLine } from '../models/line';
import { ChargingStation } from '../models/chargingStation';
import * as _ from 'lodash';

import {
  availableChargingStationModels,
  availableEvModels
} from '../components/ev-popup/ev-models';
import {
  availableStorageModels,
  availableStorageOperationalModes
} from '../components/storage-popup/storage-models';
import { Storage } from '../models/storage';
import { BatteryModel } from '../components/storage-popup/storage-popup.typings';

// ##################################################################################################################
// PV Methods
// ##################################################################################################################

export const getPvPowerListForPowerToSetup = (
  noOfNodes: number,
  powerToSetup: number
) => {
  const min = 108;
  const max = 1188;
  const step = 27;

  const pvPowerRange = _.map(_.range(min, max + 1, step), x => x / 100);

  const getExpectedPVPower = (
    noOfNodes: number,
    powerToSetup: number,
    sum: number = 0,
    pvPowers: number[] = []
  ): number[] => {
    if (noOfNodes === 0 || sum >= powerToSetup) {
      pvPowers.pop();
      return pvPowers;
    }

    let loopRange = [...pvPowerRange];
    let chosen: number = loopRange.sort((a: number, b: number) => b - a)[0];

    while (sum + chosen > powerToSetup && loopRange.length !== 0) {
      loopRange.shift();
      chosen = loopRange.sort((a: number, b: number) => b - a)[0];
    }

    if (!chosen) {
      return pvPowers;
    }

    sum += chosen;
    noOfNodes -= 1;
    pvPowers = [...pvPowers, chosen];

    return getExpectedPVPower(noOfNodes, powerToSetup, sum, pvPowers);
  };

  return getExpectedPVPower(noOfNodes, powerToSetup);
};

export const createPV = (
  nodeId: string,
  id: string,
  phases: number,
  bus: string,
  kV: number,
  maxPowerKW: number
): { pv: PV; line: VirtualLine } => {
  const pvId = id || `pv_${shortid.generate()}`;

  const pv: PV = {
    id: pvId,
    tech_id: pvId,
    phases: phases,
    bus1: bus,
    kV: kV,
    kVA: maxPowerKW,
    PF: 0.95,
    max_power_kW: maxPowerKW,
    category: 'pv'
  };

  const line: VirtualLine = createVirtualLine(nodeId, pvId, bus);

  return { pv, line };
};

// ##################################################################################################################
// Charging Station/EV Methods
// ##################################################################################################################

export const getChargingStationPowerListForPowerToSetup = (
  noOfNodes: number,
  powerToSetup: number
) => {
  const chargingStationPowerRange = Object.values(
    availableChargingStationModels
  ).map(
    (chargingStation: ChargingStation) => chargingStation.max_charging_power_kW
  );

  const getExpectedChargingStationPower = (
    noOfNodes: number,
    powerToSetup: number,
    sum: number = 0,
    chargingStationPowers: number[] = []
  ): number[] => {
    if (noOfNodes === 0 || sum >= powerToSetup) {
      chargingStationPowers.pop();
      return chargingStationPowers;
    }

    let loopRange = [...chargingStationPowerRange];
    let chosen: number = loopRange.sort((a: number, b: number) => b - a)[0];

    while (sum + chosen > powerToSetup && loopRange.length !== 0) {
      loopRange.shift();
      chosen = loopRange.sort((a: number, b: number) => b - a)[0];
    }

    if (!chosen) {
      return chargingStationPowers;
    }

    sum += chosen;
    noOfNodes -= 1;
    chargingStationPowers = [...chargingStationPowers, chosen];

    return getExpectedChargingStationPower(
      noOfNodes,
      powerToSetup,
      sum,
      chargingStationPowers
    );
  };

  return getExpectedChargingStationPower(noOfNodes, powerToSetup);
};

export const getChargingStationOfGivenPower = (
  maxChargingPowerKW: number,
  nodeId: string,
  kV: number,
  phases: number,
  bus: string,
  typeApplication: string,
  id: string = null
) => {
  const [chargingStationModelName, __] = Object.entries(
    availableChargingStationModels
  ).find(
    ([_, chargingStation]: [string, ChargingStation]) =>
      chargingStation.max_charging_power_kW === maxChargingPowerKW
  );
  const evModelNamess = Object.keys(availableEvModels);

  const evModelName = _.sample(evModelNamess);

  return createChargingStationFromModel(
    chargingStationModelName,
    evModelName,
    nodeId,
    kV,
    phases,
    bus,
    typeApplication,
    id
  );
};

export const createChargingStationFromModel = (
  chargingStationModelName: string,
  evModelName: string,
  nodeId: string,
  kV: number,
  phases: number,
  bus: string,
  typeApplication: string,
  id: string = null,
  hostedEvId: string = null
) => {
  const chargingStationId = id || `charging_station_${shortid.generate()}`;

  const { chargingStation, line } = createChargingStation(
    nodeId,
    chargingStationId,
    hostedEvId,
    phases,
    bus,
    kV,
    typeApplication,
    chargingStationModelName,
    evModelName
  );

  return { chargingStation, line };
};

export const createChargingStation = (
  nodeId: string,
  id: string,
  hostedEvId: string,
  phases: number,
  bus: string,
  kV: number,
  typeApplication: string,
  chargingStationModelName: string,
  evModelName: string
): { chargingStation: ChargingStation; line: VirtualLine } => {
  const chargingStationId = id || `charging_station_${shortid.generate()}`;
  const evId = hostedEvId || `ev_${shortid.generate()}`;

  const {
    max_charging_power_kW,
    charging_efficiency
  } = availableChargingStationModels[chargingStationModelName];

  const {
    battery_capacity_kWh,
    consumption_in_kW_pro_100_km
  } = availableEvModels[evModelName];

  const chargingStation: ChargingStation = {
    id: chargingStationId,
    tech_id: chargingStationId,
    category: 'charging_station',
    bus1: bus,
    charging_efficiency: charging_efficiency,
    kV: kV,
    max_charging_power_kW: max_charging_power_kW,
    phases: phases,
    powerfactor: 1,
    type_application: typeApplication,
    model: chargingStationModelName,
    hosted_ev: [
      {
        id: evId,
        SoC: _.random(0, 100, false),
        battery_capacity_kWh: battery_capacity_kWh,
        consumption_in_kW_pro_100_km: consumption_in_kW_pro_100_km,
        unit_consumption_assumption: 10,
        unit_drop_penalty: 1,
        model: evModelName
      }
    ]
  };

  const line: VirtualLine = createVirtualLine(nodeId, chargingStationId, bus);

  return { chargingStation, line };
};

// ##################################################################################################################
// Storage/ESS Methods
// ##################################################################################################################

export const getStoragePowerListForPowerToSetup = (
  noOfNodes: number,
  powerToSetup: number
) => {
  const storagePowerRange = Object.values(availableStorageModels).map(
    (storage: BatteryModel) => storage.nominal_charging_power
  );

  const getExpectedStoragePower = (
    noOfNodes: number,
    powerToSetup: number,
    sum: number = 0,
    chargingStationPowers: number[] = []
  ): number[] => {
    if (noOfNodes === 0 || sum >= powerToSetup) {
      // chargingStationPowers.pop();
      return chargingStationPowers;
    }

    let loopRange = [...storagePowerRange];
    let chosen: number = loopRange.sort((a: number, b: number) => b - a)[0];

    while (sum + chosen > powerToSetup && loopRange.length !== 0) {
      loopRange.shift();
      chosen = loopRange.sort((a: number, b: number) => b - a)[0];
    }

    if (!chosen) {
      return chargingStationPowers;
    }

    sum += chosen;
    noOfNodes -= 1;
    chargingStationPowers = [...chargingStationPowers, chosen];

    return getExpectedStoragePower(
      noOfNodes,
      powerToSetup,
      sum,
      chargingStationPowers
    );
  };

  return getExpectedStoragePower(noOfNodes, powerToSetup);
};

export const getStorageOfGivenPower = (
  maxChargingPowerKW: number,
  nodeId: string,
  kV: number,
  phases: number,
  bus: string,
  globalControl: boolean,
  operationalMode: string,
  id: string = null
) => {
  const [storageModelName, __] = Object.entries(availableStorageModels).find(
    ([_, storage]: [string, BatteryModel]) =>
      storage.nominal_charging_power === maxChargingPowerKW
  );

  const operationalModeName =
    operationalMode === 'Random'
      ? _.sample(Object.keys(availableStorageOperationalModes))
      : operationalMode;

  return createStorageFromModel(
    storageModelName,
    operationalModeName,
    nodeId,
    kV,
    phases,
    bus,
    globalControl,
    id
  );
};

export const createStorageFromModel = (
  batteryModelName: string,
  operationalModeName: string,
  nodeId: string,
  kV: number,
  phases: number,
  bus: string,
  globalControl: boolean,
  id: string = null
) => {
  const storageId = id || `storage_${shortid.generate()}`;

  const { storage, line } = createStorage(
    nodeId,
    storageId,
    phases,
    bus,
    kV,
    globalControl,
    batteryModelName,
    operationalModeName
  );

  return { storage, line };
};

export const createStorage = (
  nodeId: string,
  id: string,
  phases: number,
  bus: string,
  kV: number,
  globalControl: boolean,
  batteryModelName: string,
  operationalModeName: string
): { storage: Storage; line: VirtualLine } => {
  const storageId = id || `storage_${shortid.generate()}`;

  const {
    storage_capacity,
    nominal_charging_power,
    nominal_discharging_power,
    cost
  } = availableStorageModels[batteryModelName];
  const { lifetime } = availableStorageOperationalModes[operationalModeName];

  const storage: Storage = {
    id: storageId,
    tech_id: storageId,
    category: 'storage',
    phases: phases,
    bus1: bus,
    soc: _.random(20, 100, false),
    min_soc: 20,
    max_soc: 100,
    kwh: storage_capacity,
    kV: kV,
    max_charging_power: nominal_charging_power,
    max_discharging_power: nominal_discharging_power,
    powerfactor: 1,
    model: batteryModelName,
    storage_capacity: storage_capacity,
    cost: cost,
    operationalMode: operationalModeName,
    lifetime: lifetime,
    global_control: globalControl
  };

  const line: VirtualLine = createVirtualLine(nodeId, storageId, bus);

  return { storage, line };
};

// ##################################################################################################################
// Lines
// ##################################################################################################################

export const createLine = (bus1: string, bus2: string): Line => {
  const lineId = `powerline_${shortid.generate()}`;

  return {
    tech_id: lineId,
    bus1: bus1,
    bus2: bus2,
    linecode: 'PEX_4x150',
    phases: 3,
    length: 0.004,
    monitor: {
      state: 'OFF',
      var: ['kW', 'kVA', 'voltage']
    }
  };
};

export const createVirtualLine = (
  bus1: string,
  virtualBus: string,
  realBus: string
): VirtualLine => {
  const lineId = `powerline_${shortid.generate()}`;

  return {
    tech_id: lineId,
    bus1: bus1,
    bus2: virtualBus,
    realBus: realBus,
    linecode: 'CU_4x10',
    phases: 3,
    length: 0.053
  };
};
