import { environment } from '../environments/environment';

const {
  hostname,
  port,
  seHostname,
  sePort,
  professHostname,
  professPort,
  eeHostname,
  eePort,
  production
} = environment;

export class AppSettings {
  public static TOOLS = {
    explore: 'explore',
    select: 'select',
    storage: 'storage',
    pv: 'pv',
    ev: 'ev',
    house: 'house'
  };

  public static GRID_ELEMENTS = {
    radial: 'radial',
    transformer: 'transformer',
    storage: 'storage',
    pv: 'pv',
    ev: 'ev',
    house: 'house',
    node: 'node'
  };

  public static LOCATIONS = {
    fur: {
      coordinate: [56.8161, 9.01479],
      country: 'Denmark'
    },
    bolzano: {
      coordinate: [46.498, 11.262399],
      country: 'Italy'
    }
  };

  public static INITIAL_COORDS: [number, number] = [56.8161, 9.01479]; // fur
  // public static INITIAL_COORDS = [ 46.49800, 11.262399]; // bolzano

  public static DSF_SE_API_URL = 'https://simplon.fit.fraunhofer.de/se/';
}

export const hostURL = production
  ? `https://${hostname}/api`
  : `http://${hostname}:${port}`;

export const apiURL = `${hostURL}/api`;

export const seURL = production
  ? `https://${seHostname}/se/se`
  : `http://${seHostname}:${sePort}/se`;

export const professURL = `http://${professHostname}:${professPort}`;

export const eeURL = `https://${eeHostname}:${eePort}/EE/input`;

export const URL = {
  fur: `${hostURL}/ENIIG`,
  bolzano: `${hostURL}/EDYNA`
};
