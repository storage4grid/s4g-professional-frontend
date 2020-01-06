import * as L from 'leaflet';

import { isEmpty, partition } from 'lodash';
import { Load, Loads } from '../models/load';

import {
  Nodes,
  Node,
  ConnectedElement,
  NodeElements,
  NodeElement,
  VirtualNodes,
  VirtualNode
} from '../models/node';
import { Lines, Line, VirtualLines, VirtualLine } from '../models/line';

import { PV, PVs } from '../models/pv';
import { Storage, Storages } from '../models/storage';
import { ChargingStations, ChargingStation } from '../models/chargingStation';
import { IconStatus } from '../components/map/map.icons';
import {
  GridStatus,
  PopUpElement,
  PopUpElements,
  MarkerLayer
} from '../components/map/map.typings';
import { Grid } from '../models/grid';
import { cleanNodeId } from '../components/map/util';

export const parseConnectedElement = ([key, element]): ConnectedElement => ({
  tech_id: key,
  coordinate: L.latLng(element.latitudine, element.longitudine),
  elements: Object.values(element.connected_elements) || []
});

export function extractConnectedElements(elements) {
  return elements.reduce(
    (acc: NodeElements, element: NodeElement) => ({
      ...acc,
      [element.tech_id]: element
    }),
    {}
  );
}

export const partitionConnectedElement = (
  connectedElement: ConnectedElement
): [Loads, Storages, PVs, ChargingStations] => {
  let loads: Loads = {};
  let storages: Storages = {};
  let pvs: PVs = {};
  let chargingStations: ChargingStations = {};

  const noOfElements = connectedElement.elements.length;

  const nodeLatLng: L.LatLng = L.latLng(connectedElement.coordinate);

  if (noOfElements) {
    const angle = Math.ceil(360 / noOfElements) % 360;
    const radius = Math.ceil(noOfElements / 6) * 0.0003;

    const elementsWithCoordinate = connectedElement.elements.map(
      (element, index) => {
        const elementAngleInRads = (angle * index + 30) * (Math.PI / 180);

        const latitudine =
          nodeLatLng.lat + Math.sin(elementAngleInRads) * radius;
        const longitudine =
          nodeLatLng.lng + Math.cos(elementAngleInRads) * radius;

        return { latitudine, longitudine, ...element };
      }
    );

    const [pvPartition, loadOrStorageOrChargingStation] = partition(
      elementsWithCoordinate,
      (element: NodeElement) => element.category === 'pv'
    );

    const [storagePartition, loadOrChargingStation] = partition(
      loadOrStorageOrChargingStation,
      (element: Load | Storage | ChargingStation) =>
        element.category === 'storage'
    );

    const [chargingStationPartition, loadPartition] = partition(
      loadOrChargingStation,
      (element: Load | ChargingStation) =>
        element.category === 'charging_station'
    );

    loads = extractConnectedElements(loadPartition);
    storages = extractConnectedElements(storagePartition);
    pvs = extractConnectedElements(pvPartition);
    chargingStations = extractConnectedElements(chargingStationPartition);
  }

  return [loads, storages, pvs, chargingStations];
};

export const partitionConnectedElementsInNode = (
  nodes: Nodes
): [Loads, Storages, PVs, ChargingStations] => {
  let loads: Loads = {};
  let storages: Storages = {};
  let pvs: PVs = {};
  let chargingStations: ChargingStations = {};

  const connectedElements: ConnectedElement[] = Object.entries(
    nodes
  ).map(node => parseConnectedElement(node));

  connectedElements.forEach(connectedElement => {
    const [load, storage, pv, chargingStation] = partitionConnectedElement(
      connectedElement
    );

    loads = { ...loads, ...load };
    storages = { ...storages, ...storage };
    pvs = { ...pvs, ...pv };
    chargingStations = { ...chargingStations, ...chargingStation };
  });

  return [loads, storages, pvs, chargingStations];
};

export const getNodeConnections = (node: Node): string[] => {
  const connectedElement: ConnectedElement = parseConnectedElement([
    node.tech_id,
    node
  ]);

  const [loads] = partitionConnectedElement(connectedElement);

  const buses = Object.values(loads).map(load => load.bus1);

  return buses;
};

export const nodeContains = (node: Node) => {
  let hasPV = false;
  let hasEV = false;
  let hasStorage = false;
  let hasLoad = false;

  Object.values(node.connected_elements).forEach((element: NodeElement) => {
    if (element.tech_id.includes('pv_')) {
      hasPV = true;
      return;
    }
    if (element.tech_id.includes('charging_station_')) {
      hasEV = true;
      return;
    }
    if (element.tech_id.includes('storage_')) {
      hasStorage = true;
      return;
    }

    hasLoad = true;
    return;
  });

  return {
    hasPV,
    hasEV,
    hasStorage,
    hasLoad
  };
};

export const addElementToNode = (
  node: Node,
  element: PopUpElement,
  lines: VirtualLines,
  line: VirtualLine
) => {
  node.connected_elements[element.tech_id] = element;
  if (line) {
    lines[line.tech_id] = line;
  }
};

export const updateConnectedElements = (
  grid: Grid,
  nodeId: string,
  node: Node
): Grid => {
  const connectedElement: ConnectedElement = parseConnectedElement([
    nodeId,
    node
  ]);

  const [loads, storages, pvs, chargingStations] = partitionConnectedElement(
    connectedElement
  );

  const updatedGrid = {
    ...grid,
    loads: { ...grid.loads, ...loads },
    storages: { ...grid.storages, ...storages },
    pvs: { ...grid.pvs, ...pvs },
    chargingStations: {
      ...grid.chargingStations,
      ...chargingStations
    }
  };

  return updatedGrid;
};

export const removeConnectedElement = (
  node: Node,
  gridElements: PopUpElements,
  layer: MarkerLayer,
  lines: VirtualLines,
  element: PopUpElement
) => {
  delete node.connected_elements[element.tech_id];
  delete gridElements[element.tech_id];
  delete layer[element.tech_id];
  const tech_id = Object.values(lines).find(
    line => line.bus2 === element.tech_id
  ).tech_id;
  delete lines[tech_id];
};

export const setGridStatus = (status: IconStatus): GridStatus => ({
  nodeStatus: status,
  pvStatus: status,
  chargingStationStatus: status,
  storageStatus: status,
  transformerStatus: status,
  lineStatus: status
});

export const markerElementArrayToObject = elements =>
  elements.reduce(
    (prev, current) => ({
      ...prev,
      [current.tech_id]: current
    }),
    {}
  );

export const partitionVirtualNodes = (nodes: Nodes): [Nodes, Nodes] => {
  const [virtualNodeArray, normalNodeArray] = partition(nodes, (node: Node) => {
    const { hasLoad } = nodeContains(node);
    return !hasLoad;
  });

  const virtualNodes: Nodes = markerElementArrayToObject(virtualNodeArray);
  const normalNodes: Nodes = markerElementArrayToObject(normalNodeArray);

  return [virtualNodes, normalNodes];
};

export const getPopupNodeInfo = (
  nodes: Nodes,
  nodeId: string,
  virtualNodes: VirtualNodes = null
) => {
  const currentNodeId = cleanNodeId(nodeId);

  let node: Node | VirtualNode = nodes[currentNodeId];

  if (!node) {
    if (!virtualNodes) {
      return;
    }

    node = virtualNodes[currentNodeId];
  }

  const { tech_id } = node;
  const connections = getNodeConnections(node);
  const buses = connections.length === 0 ? [tech_id] : connections;

  const phases = buses.length;
  const kV = phases === 1 ? 0.23 : 0.4;
  return { tech_id, phases, kV, buses };
};

export const getNodeType = (node: Node): 'residential' | 'commercial' => {
  const categories = Object.values(node.connected_elements)
    .filter(
      element =>
        !['pv', 'storage', 'charging_station'].includes(element.category)
    )
    .map(element => element.category);

  const isResidential = categories.every(
    category => category === 'residential'
  );

  return isResidential ? 'residential' : 'commercial';
};
