import * as _ from 'lodash';
import { Node } from '../../models/node';

export const statusColorHex = (status: string): string => {
  switch (status) {
    case 'selected':
      return '#5c6bc0';
    case 'error':
      return '#e74c3c';
    case 'success':
      return '#27ae60';
    default:
      return '#000';
  }
};

export const cleanNodeId = (nodeId: string): string => {
  let currentNodeId = nodeId;

  // Rip .x from node id
  const substrEnd = nodeId.search(/\.[\d{1}]$/g);
  if (substrEnd !== -1) {
    currentNodeId = nodeId.substring(0, substrEnd);
  }

  return currentNodeId;
};

export const cleanLineId = (lineId: string): string => {
  // Rip .x from node id

  const currentLineId = lineId.match(/Line\.(\w*)/m);

  if (currentLineId) {
    return currentLineId[1];
  }

  return lineId;
};

export const getBusValue = (buses: string[], nodeId): string => {
  // const buses = ["node_a1.1", "node_a1.2", "node_a1.3", "node_a1.1"]

  const uniqueBuses = _.uniq(buses);

  const phasesPresent = _.flatten(
    uniqueBuses.map(bus => bus.match(/[\d{1}]$/g))
  );

  const isThreePhase = _.isEqual(_.sortBy(phasesPresent), ['1', '2', '3']);

  return isThreePhase ? nodeId : buses[0];
};
