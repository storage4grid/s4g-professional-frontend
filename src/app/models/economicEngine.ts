export interface EssInformation {
  kwh: number;
  lifetime: number;
  location: string;
}

export interface EconomicEngineRequest {
  simulation_id: number;
  grid_name: string;
  kwp: number;
  kwh_losses: number;
  simulation_time: number;
  ESS_info: EssInformation[];
}

export interface EconomicEngineResponse {
  simulation_id: string;
  scenario_id: number;
  scenario_name: string;
  TCO_DSO: number;
  TCO_Difference: number;
  TCO_Community: number;
}
