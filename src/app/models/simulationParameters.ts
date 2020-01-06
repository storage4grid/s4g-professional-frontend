export type LoadProfile = string;

export interface Duration {
  days: number;
  months: number;
  years: number;
}

export interface PenetrationLevel {
  pv: number;
  ev: number;
  storage: number;
}

export interface SimulationParameters {
  duration: number;
  durationState: Duration;
  penetrationLevel: PenetrationLevel;
  loadProfile: LoadProfile;
}
