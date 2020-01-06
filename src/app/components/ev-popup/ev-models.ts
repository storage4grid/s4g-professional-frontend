import { ChargingStationModels, EvModels } from './ev-popup.typings';

export const availableChargingStationModels: ChargingStationModels = {
  'Charging Station 3kW': {
    max_charging_power_kW: 3,
    charging_efficiency: 95
  },
  'Charging Station 22kW': {
    max_charging_power_kW: 22,
    charging_efficiency: 95
  }
};

export const availableEvModels: EvModels = {
  'Volskwagen e-Up': {
    battery_capacity_kWh: 18.7,
    consumption_in_kW_pro_100_km: 16.8
  },
  'Renault Zoe': {
    battery_capacity_kWh: 44.1,
    consumption_in_kW_pro_100_km: 15.8
  }
};
