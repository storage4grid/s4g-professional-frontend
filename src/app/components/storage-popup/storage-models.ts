import { BatteryModels, OperationalModes } from './storage-popup.typings';

export const availableStorageModels: BatteryModels = {
  'Battery 4.5': {
    storage_capacity: 4.5,
    nominal_charging_power: 2.4,
    nominal_discharging_power: 2.4,
    battery_technology: 'LiFePO4',
    dimension: '955 x 570 x 611 mm',
    weight: 91,
    cost: 4000
  },
  'Battery 6.0': {
    storage_capacity: 6,
    nominal_charging_power: 3.2,
    nominal_discharging_power: 3.2,
    battery_technology: 'LiFePO4',
    dimension: '955 x 570 x 611 mm',
    weight: 108,
    cost: 4900
  },
  'Battery 7.5': {
    storage_capacity: 7.5,
    nominal_charging_power: 4.0,
    nominal_discharging_power: 4.0,
    battery_technology: 'LiFePO4',
    dimension: '955 x 570 x 611 mm',
    weight: 125,
    cost: 5600
  },
  'Battery 9.0': {
    storage_capacity: 9.0,
    nominal_charging_power: 4.8,
    nominal_discharging_power: 4.8,
    battery_technology: 'LiFePO4',
    dimension: '955 x 570 x 611 mm',
    weight: 142,
    cost: 6300
  },
  'Battery 10.5': {
    storage_capacity: 10.5,
    nominal_charging_power: 5.6,
    nominal_discharging_power: 5.6,
    battery_technology: 'LiFePO4',
    dimension: '955 x 570 x 611 mm',
    weight: 159,
    cost: 7000
  },
  'Battery 12.0': {
    storage_capacity: 12.0,
    nominal_charging_power: 6.4,
    nominal_discharging_power: 6.4,
    battery_technology: 'LiFePO4',
    dimension: '955 x 570 x 611 mm',
    weight: 176,
    cost: 7700
  }
};

export const availableStorageOperationalModes: OperationalModes = {
  'Minimize Costs': {
    lifetime: 21
  },
  'Maximize Self-Consumption': {
    lifetime: 24
  },
  'Support of Voltage Regulation': {
    lifetime: 21
  },
  'EV support': {
    lifetime: 6
  }
};
