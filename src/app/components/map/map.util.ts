import * as L from "leaflet";
import * as _ from "lodash";

import {
  MarkerLayer,
  MarkerElements,
  MarkerElement,
  VirtualNodeLayer,
  LineLayer,
  GridLayer
} from "./map.typings";

import {
  nodeMarker,
  iconMarker,
  createIcon,
  IconStatus,
  Labels,
  IconNames
} from "./map.icons";

import { Nodes, Node, VirtualNodes } from "../../models/node";
import { Lines, VirtualLines, VirtualLine, Line } from "../../models/line";

import { PV, PVs } from "../../models/pv";
import { Storage, Storages } from "../../models/storage";
import { Transformer, Transformers } from "../../models/transformer";
import { Grid, GridElements } from "../../models/grid";
import { statusColorHex, cleanLineId } from "./util";
import {
  SimulationResult,
  Currents,
  Voltages,
  Losses,
  Phase,
  Phases
} from "../../models/simulationResult";
import {
  ChargingStations,
  ChargingStation
} from "../../models/chargingStation";
import { createVirtualLine } from "../../utils/factories";
import { Linecodes } from "../../models/linecode";

export const radialStyle = (
  status: IconStatus,
  virtual: boolean = false
): L.PolylineOptions => ({
  color: status === "ready" ? "#000" : statusColorHex(status),
  weight: 2.5,
  dashArray: virtual ? [2, 5] : null
});
// Typings

type Element = PV | Storage | Transformer;

type Models = Nodes | PVs | Storages | Transformers | ChargingStations;

interface Elements {
  [key: string]: Element;
}

// Helper functions

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export const filterLatLng = element =>
  element.latitudine !== 0 &&
  element.longitudine !== 0 &&
  "latitudine" in element &&
  "longitudine" in element;

export const getNodeCoordinates = (node: Node): L.LatLng =>
  L.latLng(node.latitudine, node.longitudine);

export function createVirtualLines(nodes: Nodes): VirtualLines {
  const virtualLines: VirtualLine[][] = Object.entries(nodes).map(
    ([nodeId, node]: [string, Node]) => {
      type Buses = {
        virtualBus: string;
        realBus: string;
      };

      const elements = Object.entries(node.connected_elements).map(
        ([id, element]) => ({
          virtualBus: id,
          realBus: element.bus1
        })
      );

      const virtualLines: VirtualLine[] = elements.map(
        ({ virtualBus, realBus }) =>
          createVirtualLine(nodeId, virtualBus, realBus)
      );

      return virtualLines;
    }
  );

  return _.flatten(virtualLines).reduce(
    (lines: VirtualLines, line: VirtualLine) => ({
      ...lines,
      [line.tech_id]: line
    }),
    {}
  );
}

export function virtualLineMarkers(
  grid: Grid,
  lines: VirtualLines,
  linecodes: Linecodes,
  status: IconStatus
): LineLayer {
  const layerGroup: LineLayer = Object.values(lines).reduce(
    (prevLines: LineLayer, radial: VirtualLine) => {
      // List of elements that will be connected with lines in map
      const { loads, transformers, ...otherElements } = grid;

      const elements: Elements = Object.values(otherElements).reduce(
        (previousElements: Elements, gridElement: Elements) => ({
          ...previousElements,
          ...gridElement
        }),
        {}
      );

      let connection1: Element = Object.values(elements).find(node =>
        node.tech_id.includes(radial.bus1)
      );

      let connection2: Element = Object.values(elements).find(node =>
        node.tech_id.includes(radial.bus2)
      );

      if (!connection1 || !connection2) {
        return prevLines;
      }

      const coordinates: L.LatLng[] = [connection1, connection2]
        .filter(filterLatLng)
        .map((connection: Element) => {
          return L.latLng(connection.latitudine, connection.longitudine);
        });

      const line = L.polyline(coordinates, radialStyle(status, true));

      return { ...prevLines, [radial.tech_id]: line };
    },
    {}
  );

  return layerGroup;
}

export function lineMarkers(
  grid: Grid,
  lines: Lines,
  linecodes: Linecodes,
  status: IconStatus
): LineLayer {
  const layerGroup: LineLayer = Object.values(lines).reduce(
    (prevLines: LineLayer, radial: Line) => {
      const { max_current } = linecodes[radial.linecode];
      // List of elements that will be connected with lines in map
      const { loads, transformers, ...otherElements } = grid;

      const elements: Elements = Object.values(otherElements).reduce(
        (previousElements: Elements, gridElement: Elements) => ({
          ...previousElements,
          ...gridElement
        }),
        {}
      );

      let connection1: Element = Object.values(elements).find(node =>
        node.tech_id.includes(radial.bus1)
      );

      let connection2: Element = Object.values(elements).find(node =>
        node.tech_id.includes(radial.bus2)
      );

      if (!connection1) {
        connection1 = Object.values(transformers).find(
          transformer => transformer.bus2 === radial.bus1
        );
      }

      if (!connection2) {
        connection2 = Object.values(transformers).find(
          transformer => transformer.bus1 === radial.bus2
        );
      }

      if (!connection1 || !connection2) {
        return prevLines;
      }

      const coordinates: L.LatLng[] = [connection1, connection2]
        .filter(filterLatLng)
        .map((connection: Element) => {
          return L.latLng(connection.latitudine, connection.longitudine);
        });

      const line = L.polyline(coordinates, radialStyle(status)).bindPopup(
        lineInformation(radial, max_current)
      );

      return { ...prevLines, [radial.tech_id]: line };
    },
    {}
  );

  return layerGroup;
}

export function createNodeMarkers(
  nodes: Nodes,
  status: IconStatus
): VirtualNodeLayer {
  return Object.values(nodes)
    .filter(filterLatLng)
    .reduce(
      (accumulator: VirtualNodeLayer, node: Node) => ({
        ...accumulator,
        [node.tech_id]: nodeMarker(
          getNodeCoordinates(node),
          status
        ).bindTooltip(node.tech_id)
      }),
      {}
    );
}

export function createIconMarkers(
  values: MarkerElements,
  label: Labels,
  name: IconNames,
  status: IconStatus
): MarkerLayer {
  return Object.values(values)
    .filter(filterLatLng)
    .reduce((accumulator: MarkerLayer, value: MarkerElement) => {
      const marker = iconMarker(
        label,
        [value.latitudine, value.longitudine],
        status
      ).unbindTooltip();

      if (status === "ready") {
        marker.bindTooltip(value.tech_id);
      } else {
        marker.bindTooltip(name);
      }

      return {
        ...accumulator,
        [value.tech_id]: marker
      };
    }, {});
}

export const lineInformation = (
  line: Line,
  maxCurrent: number,
  current: Phases = null,
  loss: number = null,
  errorStatus: boolean = false
) => {
  const lossDisplay = loss ? displayLoss(loss) : "";

  const currentDisplay = current ? displayPhases(current, "current") : "";

  return `
  <div class="line-popup-information">
    <span> <b>Line status :</b> ${errorStatus ? "Error" : "Ok"} </span>
    <br />
    <span class="line-popup-linecode"> <b>Linecode :</b> ${line.linecode}</span>
    <span class="line-popup-length"> <b>Length :</b> ${line.length} km</span>
    <span class="line-popup-maxcurrent"> <b>Max Current :</b> ${maxCurrent} A</span>
    <br/>
    ${
      lossDisplay
        ? `<div class="result-popup">
      ${lossDisplay}
    </div>`
        : ""
    }
    <br/>
    ${
      currentDisplay
        ? `<div class="result-popup">
      <span class="result-popup-label"><b>Current :</b></span>
      <br/>
      ${currentDisplay}
    </div>`
        : ""
    }
  </div>
  `;
};

export const pvInformation = (pv: PV) => {
  return `
  <div>
    <h3>PV Information</h3>
    <div class="pv-popup-information">
      <span class="line-popup-linecode"> <b>ID: </b> ${pv.tech_id}</span>
      <span class="line-popup-linecode"> <b>Maximum Power: </b> ${pv.kVA} kW</span>
    </div>
  </div>
  `;
};

export const chargingStationInformation = (
  chargingStation: ChargingStation
) => {
  return `
  <div>
    <h3>Charging Station Information</h3>
    <div class="ev-popup-information">
      <span class="line-popup-linecode"> <b>ID: </b> ${chargingStation.tech_id}</span>
      <span class="line-popup-linecode"> <b>Maximum charging Power: </b> ${chargingStation.max_charging_power_kW} kW</span>
    </div>
    <br/>
    <div class="ev-popup-information">
      <h3>Hosted EV information</h3>
      <span class="line-popup-linecode"> <b>Model: </b> ${chargingStation.hosted_ev[0].model} kW</span>
      <span class="line-popup-linecode"> <b>Battery capacity: </b> ${chargingStation.hosted_ev[0].battery_capacity_kWh} kWh</span>
    </div>
  </div>
  `;
};

export const storageInformation = (storage: Storage) => {
  return `
  <div>
    <h3>Storage Information</h3>
    <div class="ess-popup-information">
      <span class="line-popup-linecode"> <b>ID: </b> ${
        storage.tech_id
      } kW</span>
      <span class="line-popup-linecode"> <b>Battery Model: </b> ${
        storage.model
      }</span>
      <span class="line-popup-linecode"> <b>Storage Capacity: </b> ${
        storage.storage_capacity
      }</span>
      <span class="line-popup-linecode"> <b>Nominal Charging Power: </b> ${
        storage.max_charging_power
      }</span>
      <span class="line-popup-linecode"> <b>Nominal Discharging Power: </b> ${
        storage.max_discharging_power
      }</span>
      <span class="line-popup-linecode"> <b>Operational Mode: </b> ${
        storage.operationalMode
      }</span>
      <span class="line-popup-linecode"> <b>Lifetime: </b> ${
        storage.lifetime
      }</span>
      <span class="line-popup-linecode"> <b>Global Control: </b> ${
        storage.global_control ? "Enabled" : "Disabled"
      }</span>
      
    </div>
  </div>
  `;
};

export const getUnit = (type: string) => {
  if (type === "current") return "A";
  if (type === "voltage") return "pu";
};

const displayPhases = (phases: Phases, type: string) => {
  const unit = getUnit(type);

  return Object.entries(phases)
    .map(([key, phase]) => {
      return `
      <span class="result-popup-sublabel">${key}</span>
      <span class="result-popup-phases">
        ${
          type == "current"
            ? ""
            : `<span class="result-popup-value 
                  ${phase.min < 0.9 && "result-popup-error"}">
                Minimum: ${Number(phase.min).toFixed(3)} ${unit}</span>
                  `
        }
        <span
          class="result-popup-value ${phase.max > 1.1 && "result-popup-error"} "
          >Maximum: ${Number(phase.max).toFixed(3)} ${unit}</span
        >
      </span>
      <br/>
      `;
    })
    .join("");
};

const mapVoltageResultsToNodes = (
  nodes: Nodes,
  nodeLayers: MarkerLayer,
  voltages: Voltages
) => {
  Object.keys(nodeLayers).forEach((nodeId: string) => {
    const voltage = voltages[nodeId];
    if (!voltage) return;

    const nodeMarker = nodeLayers[nodeId];
    let node = nodes[nodeId];

    if (!node || !nodeMarker) return;

    const errorStatus =
      Object.values(voltage).filter(phase => phase.min < 0.9 || phase.max > 1.1)
        .length > 0;

    const voltageResult = displayPhases(voltage, "voltage");

    const popup = `
    <div class="simulation-result">
      <h3>Simulation Results: ${
        errorStatus ? "Voltage limit violation" : "Ok"
      } </h3>
      <div class="result-popup">
        <span class="result-popup-label">Voltage :</span>
        <br/>
        ${voltageResult}
      </div>
    </div>
    `;

    if (errorStatus) {
      nodeMarker
        .setIcon(createIcon("house", "error"))
        .unbindTooltip()
        .bindPopup(popup);
      return "error";
    }

    nodeMarker
      .setIcon(createIcon("house", "success"))
      .unbindTooltip()
      .bindPopup(popup);
  });
};

const mapVoltageResultsToVirtualNodes = (
  virtualNodes: Nodes,
  virtualNodeLayers: VirtualNodeLayer,
  voltages: Voltages
) => {
  Object.keys(virtualNodes).forEach((virtualNodeId: string) => {
    const voltage = voltages[virtualNodeId];
    if (!voltage) return;

    const virtualNodeMarker = virtualNodeLayers[virtualNodeId];
    let virtualNode = virtualNodes[virtualNodeId];

    if (!virtualNode || !virtualNodeMarker) return;

    const errorStatus =
      Object.values(voltage).filter(phase => phase.min < 0.9 || phase.max > 1.1)
        .length > 0;

    const voltageResult = displayPhases(voltage, "voltage");

    const popup = `
    <div class="simulation-result">
      <h3>Simulation Results: ${
        errorStatus ? "Voltage limit violation" : "Ok"
      } </h3>
      <div class="result-popup">
        <span class="result-popup-label">Voltage :</span>
        <br/>
        ${voltageResult}
      </div>
    </div>
    `;

    if (errorStatus) {
      virtualNodeMarker
        .setStyle({
          fillColor: statusColorHex("error"),
          color: statusColorHex("error")
        })
        .unbindTooltip()
        .bindPopup(popup);
      return "error";
    }

    virtualNodeMarker
      .setStyle({
        fillColor: statusColorHex("success"),
        color: statusColorHex("success")
      })
      .unbindTooltip()
      .bindPopup(popup);
  });
};

const mapCurrentAndLossResultsToLines = (
  lines: Lines,
  linecodes: Linecodes,
  lineLayers: LineLayer,
  currents: Currents,
  losses: Losses
) => {
  Object.keys(lines).forEach((lineId: string) => {
    const current = currents[lineId];
    const loss = losses.Line[lineId];
    if (!current || !loss) return;

    const lineLayer = lineLayers[lineId];
    const line = lines[lineId];

    if (!line) return;

    const { max_current } = linecodes[line.linecode];

    const errorStatus =
      Object.values(current).filter(phase => phase.max > max_current).length >
      0;

    const popup = lineInformation(
      line,
      max_current,
      current,
      loss,
      errorStatus
    );

    if (errorStatus) {
      lineLayer
        .setStyle(radialStyle("error"))
        .unbindTooltip()
        .bindPopup(popup);

      return;
    }

    lineLayer
      .setStyle(radialStyle("success"))
      .unbindTooltip()
      .bindPopup(popup);
  });
};

export const addPvInfo = (pvs: PVs, pvLayer: MarkerLayer) => {
  Object.entries(pvLayer).forEach(([tech_id, layer]) => {
    const pv = pvs[tech_id];
    layer.bindPopup(pvInformation(pv));
  });
};

export const addStorageInfo = (
  storages: Storages,
  storagelayer: MarkerLayer
) => {
  Object.entries(storagelayer).forEach(([tech_id, layer]) => {
    const storage = storages[tech_id];
    layer.bindPopup(storageInformation(storage));
  });
};

export const addChargingStationInfo = (
  chargingStations: ChargingStations,
  chargingStationLayer: MarkerLayer
) => {
  Object.entries(chargingStationLayer).forEach(([tech_id, layer]) => {
    const chargingStation = chargingStations[tech_id];
    layer.bindPopup(chargingStationInformation(chargingStation));
  });
};

export const processSimulationResult = (
  grid: Grid,
  gridElements: GridElements,
  gridLayer: GridLayer,
  lineLayers: LineLayer,
  result: SimulationResult
) => {
  const { nodes, virtualNodes, pvs, storages, chargingStations } = grid;
  const { lines, linecodes } = gridElements;
  const {
    nodeLayer,
    virtualNodeLayer,
    pvLayer,
    storageLayer,
    chargingStationLayer
  } = gridLayer;

  const { voltages, currents, losses } = result;

  mapVoltageResultsToNodes(nodes, nodeLayer, voltages);

  mapVoltageResultsToVirtualNodes(virtualNodes, virtualNodeLayer, voltages);

  addPvInfo(pvs, pvLayer);
  addStorageInfo(storages, storageLayer);
  addChargingStationInfo(chargingStations, chargingStationLayer);

  mapCurrentAndLossResultsToLines(
    lines,
    linecodes,
    lineLayers,
    currents,
    losses
  );

  return "success";
};
function displayLoss(loss: number) {
  return `<span class="line-popup-loss">
    <b>Loss :</b> ${loss.toFixed(2)} 
    </span>`;
}
