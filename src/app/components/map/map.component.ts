import * as L from "leaflet";

// ******** Angular Modules *********
import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import {
  VERSION,
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";

import * as shortid from "shortid";

import * as _ from "lodash";

// ******** Components *********
import { PrivacyPromptComponent } from "../privacy-prompt/privacy-prompt.component";
import { StoragePopupComponent } from "../storage-popup/storage-popup.component";

import { AppSettings } from "../../app-config";
import { GridService } from "../../services/grid.service";

import { leafletOptions, markerClusterOptions } from "./map.config";
import {
  GridElementsLayer,
  GridLayer,
  SimulationStatus,
  PopupConfig,
  GridStatus,
  MarkerLayer,
  PopUpElement,
  PopUpElements,
  PopupNodeInfo
} from "./map.typings";

import { Nodes, Node, ConnectedElement } from "../../models/node";
import { Storage, Storages } from "../../models/storage";
import { GridElements, Grid } from "../../models/grid";

import {
  lineMarkers,
  createIconMarkers,
  processSimulationResult,
  radialStyle,
  createNodeMarkers,
  virtualLineMarkers,
  createVirtualLines
} from "./map.util";
import {
  iconMarker,
  nodeMarker,
  createIcon,
  IconStatus,
  Labels
} from "./map.icons";

import {
  parseConnectedElement,
  partitionConnectedElement,
  partitionConnectedElementsInNode,
  getNodeConnections,
  nodeContains,
  setGridStatus,
  partitionVirtualNodes,
  removeConnectedElement,
  addElementToNode,
  updateConnectedElements,
  getPopupNodeInfo,
  getNodeType
} from "../../utils/parseData";

import {
  SimulationResult,
  ResponseMessage
} from "../../models/simulationResult";

import {
  StoragePopupResult,
  StoragePopupInputData
} from "../storage-popup/storage-popup.typings";
import { DbService } from "../../services/db.service";
import { Simulation as DbSimulationResults } from "../../services/db.typings";
import { SimulationParameters } from "../../models/simulationParameters";
import { EconomicEngineResponse } from "../../models/economicEngine";
import { PV, PVs } from "../../models/pv";
import { PvPopupComponent } from "../pv-popup/pv-popup.component";
import { PvPopupResult, PvPopupInputData } from "../pv-popup/pv-popup.typings";
import {
  ChargingStation,
  ChargingStations
} from "../../models/chargingStation";
import { EvPopupComponent } from "../ev-popup/ev-popup.component";
import { EvPopupResult, EvPopupInputData } from "../ev-popup/ev-popup.typings";
import { ToolboxComponent } from "../toolbox/toolbox.component";
import { Load } from "../../models/load";
import { Line, Lines } from "../../models/line";
import {
  createPV,
  getPvPowerListForPowerToSetup,
  getChargingStationPowerListForPowerToSetup,
  getChargingStationOfGivenPower,
  getStorageOfGivenPower,
  getStoragePowerListForPowerToSetup
} from "../../utils/factories";
import { cleanNodeId, statusColorHex, getBusValue } from "./util";

/**
 * This component handles the map view, which is restricted to authenticated users only.
 * It also is the main component handling all actions involving element creation and simulation.
 */
@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["map.component.scss"]
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  version = VERSION;

  /**
   * Privacy prompt to inform the user about data issues
   */
  privacyPrompt: any;

  /**
   * open privacy prompt value, read from local storage
   **/

  showPrivacyPrompt: true;

  /* Search error */
  searchErrorMessage: string;

  /* Grid details */

  locations: string[] = Object.keys(AppSettings.LOCATIONS);

  gridStatus: GridStatus = setGridStatus("ready");

  mapClass = "info-cursor-enabled";

  @ViewChild(ToolboxComponent) toolbox: ToolboxComponent;

  /* Leaflet layers and other information */

  // Values to bind to Leaflet Directive

  map: L.Map;
  options: L.MapOptions = leafletOptions;

  location: string;

  gridElements: GridElements = {
    lines: {},
    virtualLines: {},
    linecodes: {}
  };
  gridElementsLayer: GridElementsLayer = {
    lineLayer: {},
    virtualLineLayer: {}
  };

  grid: Grid = {
    nodes: {},
    virtualNodes: {},
    loads: {},
    pvs: {},
    storages: {},
    transformers: {},
    chargingStations: {}
  };

  gridLayer: GridLayer = {
    nodeLayer: {},
    virtualNodeLayer: {},
    pvLayer: {},
    storageLayer: {},
    transformerLayer: {},
    chargingStationLayer: {}
  };

  selectMode = true;

  economicEngineResponse: EconomicEngineResponse;

  // Marker cluster stuff
  markerClusterGroup: L.MarkerClusterGroup;
  markerClusterData: L.Marker[] = [];
  markerClusterOptions: L.MarkerClusterGroupOptions = markerClusterOptions;

  simulationStatus: SimulationStatus = "";

  simulationErrorMessage: string = "";
  errorCount = 0;

  totalLoadPower: string = "0.00";
  totalPvPower: string = "0.00";

  storagePopupRef: MatDialogRef<StoragePopupComponent>;
  pvPopupRef: MatDialogRef<PvPopupComponent>;
  chargingStationPopupRef: MatDialogRef<EvPopupComponent>;

  constructor(
    private gridService: GridService,
    private dbService: DbService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private zone: NgZone
  ) {
    if (!localStorage.getItem("defaultLocation")) {
      localStorage.setItem("defaultLocation", "fur");
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.location =
        params["location"] || localStorage.getItem("defaultLocation");

      this.populateData(this.location);

      if (this.map) {
        const [latitude, longitude] = AppSettings.LOCATIONS[
          this.location
        ].coordinate;

        this.map
          .panTo(L.latLng(latitude, longitude))
          .setZoom(leafletOptions.zoom);
      }
    });

    // open privacyPrompt
    /**
     * open the privacy prompt dialog
     * needed to use setTimeout to prevent ExpressionChangedAfterItHasBeenCheckedError #5268; more info can be found
     * on the gitHub page https://github.com/angular/material2/issues/5268
     **/
    setTimeout(() => this.openPrivacyPrompt());
  }

  ngAfterViewInit() {
    this.toolbox.activateTool(AppSettings.TOOLS.explore);

    this.moveMapTo(this.location);
  }

  populateData(location: string): void {
    this.gridService
      .getGridData(location)
      .subscribe(([nodes, lines, linecodes, transformers]) => {
        const [virtualNodes, normalNodes] = partitionVirtualNodes(nodes);

        const [
          loads,
          storages,
          pvs,
          chargingStations
        ] = partitionConnectedElementsInNode(nodes);

        const virtualLines = createVirtualLines(nodes);

        this.grid = {
          nodes: normalNodes,
          virtualNodes: virtualNodes,
          loads: loads,
          storages: storages,
          pvs: pvs,
          transformers: transformers,
          chargingStations: chargingStations
        };

        this.gridElements = {
          lines: lines,
          virtualLines: virtualLines,
          linecodes: linecodes
        };

        this.createMarkers();
        this.displayData();
        // For testing simulation
        // this.startSimulation('event');
      });
  }

  createMarkers(updateNodes: boolean = true) {
    const {
      chargingStationStatus,
      lineStatus,
      nodeStatus,
      pvStatus,
      storageStatus,
      transformerStatus
    } = this.gridStatus;

    if (updateNodes) {
      this.gridLayer.virtualNodeLayer = createNodeMarkers(
        this.grid.virtualNodes,
        nodeStatus
      );

      this.gridLayer.nodeLayer = createIconMarkers(
        this.grid.nodes,
        "house",
        "House",
        nodeStatus
      );
    }

    this.gridLayer.pvLayer = createIconMarkers(
      this.grid.pvs,
      "pv",
      "PV",
      pvStatus
    );

    this.gridLayer.chargingStationLayer = createIconMarkers(
      this.grid.chargingStations,
      "ev",
      "EV",
      chargingStationStatus
    );

    this.gridLayer.storageLayer = createIconMarkers(
      this.grid.storages,
      "storage",
      "Storage",
      storageStatus
    );

    this.gridLayer.transformerLayer = createIconMarkers(
      this.grid.transformers,
      "transformer",
      "Transformer",
      transformerStatus
    );

    this.gridElementsLayer.lineLayer = lineMarkers(
      this.grid,
      this.gridElements.lines,
      this.gridElements.linecodes,
      lineStatus
    );

    this.gridElementsLayer.virtualLineLayer = virtualLineMarkers(
      this.grid,
      this.gridElements.virtualLines,
      this.gridElements.linecodes,
      lineStatus
    );

    this.totalPvPower = this.getTotalPvPower();
    this.totalLoadPower = this.getTotalLoadPower();
  }

  displayData() {
    this.markerClusterGroup.clearLayers();

    this.markerClusterGroup.addLayers(
      Object.values(this.gridElementsLayer.lineLayer)
    );

    this.markerClusterGroup.addLayers(
      Object.values(this.gridElementsLayer.virtualLineLayer)
    );

    this.markerClusterGroup.addLayers(Object.values(this.gridLayer.nodeLayer));
    this.markerClusterGroup.addLayers(
      Object.values(this.gridLayer.virtualNodeLayer)
    );

    this.markerClusterGroup.addLayers(Object.values(this.gridLayer.pvLayer));

    this.markerClusterGroup.addLayers(
      Object.values(this.gridLayer.chargingStationLayer)
    );

    this.markerClusterGroup.addLayers(
      Object.values(this.gridLayer.storageLayer)
    );

    this.markerClusterGroup.addLayers(
      Object.values(this.gridLayer.transformerLayer)
    );

    this.markerClusterGroup.refreshClusters();

    if (this.selectMode) {
      this.markerClusterGroup.once("click", () => {
        this.zone.run(() => {
          this.simulationStatus = "selected";

          this.gridStatus = setGridStatus("selected");

          this.createMarkers();
          this.displayData();
        });
      });
    }
  }

  /* PROMPT */

  openPrivacyPrompt(): void {
    // check browserStorage if prompt should be displayed
    try {
      this.showPrivacyPrompt = JSON.parse(
        localStorage.getItem("S4GShowPrivacyPromptProfGui")
      );
    } catch (e) {
      this.showPrivacyPrompt = true;
    }
    if (this.showPrivacyPrompt || this.showPrivacyPrompt == null) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.maxWidth = "600px";
      dialogConfig.maxHeight = "600px";

      this.privacyPrompt = this.dialog.open(
        PrivacyPromptComponent,
        dialogConfig
      );
    }
  }

  /* EVENTS */

  onMapReady(map: L.Map) {
    this.map = map;
  }

  markerClusterReady(group: L.MarkerClusterGroup) {
    this.markerClusterGroup = group;
  }

  moveMapTo(location: string) {
    const locations = AppSettings.LOCATIONS;

    if (location in locations) {
      this.map
        .panTo(locations[location].coordinate)
        .setZoom(leafletOptions.zoom);
    } else {
      this.searchErrorMessage = "Search location not found";
    }
  }

  // ##################################################################################################################
  // Storage/ESS Methods
  // ##################################################################################################################

  setStoragePenetrationLevel({
    state,
    penetrationLevel,
    backup,
    operationalMode
  }) {
    this.toolbox.activateTool(AppSettings.TOOLS.storage);

    if (!state) {
      const { grid, gridElements } = this.dbService.restoreGrid();

      this.grid = grid;
      this.gridElements = gridElements;

      this.createMarkers();
      this.displayData();
    } else {
      if (backup) {
        this.dbService.backupGrid(this.grid, this.gridElements);
      }

      this.removeExistingStoragesCreatedForPenetrationLevel();
      this.createStoragesForPenetration(penetrationLevel, operationalMode);

      this.createMarkers(false);

      Object.entries(this.gridLayer.storageLayer).forEach(
        this.addStoragePopupToStorageLayer
      );

      this.displayData();
    }
  }

  private removeExistingStoragesCreatedForPenetrationLevel() {
    Object.values(this.grid.storages)
      .filter((storage: Storage) => storage.tech_id.includes("_4PL"))
      .forEach((storage: Storage) => {
        const nodeId = storage.bus1;

        const currentNodeId = cleanNodeId(nodeId);

        let node = this.grid.nodes[currentNodeId];

        if (!node) return;

        removeConnectedElement(
          node,
          this.grid.storages,
          this.gridLayer.storageLayer,
          this.gridElements.virtualLines,
          storage
        );
      });
  }

  private createStoragesForPenetration(
    penetrationLevel: number,
    operationalMode: string
  ) {
    const totalPvPower = this.getTotalPvPower();

    const powerToInclude = parseFloat(totalPvPower) * (penetrationLevel / 100);

    const existingChargingStationPower = Object.values(
      this.grid.storages
    ).reduce((total: number, storage: Storage) => {
      return total + storage.max_charging_power;
    }, 0);

    const powerToSetup = powerToInclude - existingChargingStationPower;

    if (powerToSetup <= 0) return;

    const nodesWithoutStorage = Object.entries(this.grid.nodes)
      .filter(([_, node]: [string, Node]) => {
        const { hasStorage, hasPV } = nodeContains(node);
        return hasPV && !hasStorage;
      })
      .map(([nodeId, _]) => nodeId);

    const noOfNodes = nodesWithoutStorage.length;

    const storagePowerList = getStoragePowerListForPowerToSetup(
      noOfNodes,
      powerToSetup
    );

    const nodeIds = _.sampleSize(nodesWithoutStorage, storagePowerList.length);

    nodeIds.forEach((nodeId: string, index) => {
      const currentNodeId = cleanNodeId(nodeId);

      const node: Node = this.grid.nodes[currentNodeId];
      const buses = getNodeConnections(node);
      const phases = buses.length;
      const kV = phases === 1 ? 0.23 : 0.4;
      const bus = getBusValue(buses, nodeId);

      const id = `storage_${shortid.generate()}_4PL`;
      const maxChargingPowerKW = storagePowerList[index];

      // const globalControl = _.sample([true, false]);
      const globalControl = false;

      const { storage, line } = getStorageOfGivenPower(
        maxChargingPowerKW,
        currentNodeId,
        kV,
        phases,
        bus,
        globalControl,
        operationalMode,
        id
      );

      addElementToNode(node, storage, this.gridElements.virtualLines, line);

      this.grid = updateConnectedElements(this.grid, currentNodeId, node);

      this.gridStatus = {
        ...this.gridStatus,
        storageStatus: "success"
      };
    });
  }

  openStoragePopup(
    nodeInfo: PopupNodeInfo,
    storage: Storage = null,
    addon: boolean = false
  ) {
    const storagePopupConfig: PopupConfig<StoragePopupInputData> = {
      width: "600px",
      maxWidth: "600px",
      data: {
        node: nodeInfo,
        storage
      }
    };

    this.storagePopupRef = this.dialog.open(
      StoragePopupComponent,
      storagePopupConfig
    );

    this.storagePopupRef
      .afterClosed()
      .subscribe(
        ({ nodeId, storage, line, deleteStorage }: StoragePopupResult) => {
          if (!nodeId) {
            return;
          }

          const currentNodeId = cleanNodeId(nodeId);

          const node = this.grid.nodes[currentNodeId];

          if (deleteStorage) {
            removeConnectedElement(
              node,
              this.grid.storages,
              this.gridLayer.storageLayer,
              this.gridElements.virtualLines,
              storage
            );
          } else {
            const { hasPV } = nodeContains(node);
            if (!hasPV) {
              const nodeInfo = getPopupNodeInfo(this.grid.nodes, nodeId);

              this.zone.run(() => {
                this.openPvPopup(nodeInfo, null, true);
              });
            }

            addElementToNode(
              node,
              storage,
              this.gridElements.virtualLines,
              line
            );
          }

          this.grid = updateConnectedElements(this.grid, nodeId, node);

          if (!addon) {
            this.gridStatus = {
              ...this.gridStatus,
              storageStatus: "success"
            };
          }

          this.createMarkers(false);

          Object.values(this.grid.storages).forEach((storage: Storage) => {
            const nodeInfo = getPopupNodeInfo(this.grid.nodes, nodeId);

            this.gridLayer.storageLayer[storage.tech_id] = iconMarker(
              "storage",
              [storage.latitudine, storage.longitudine],
              "success"
            ).addEventListener("click", () => {
              this.zone.run(() => {
                this.openStoragePopup(nodeInfo, storage);
              });
            });
          });

          this.displayData();
        }
      );
  }

  storageClicked() {
    Object.entries(this.gridLayer.storageLayer).forEach(
      this.addStoragePopupToStorageLayer
    );

    Object.entries(this.gridLayer.nodeLayer).forEach(
      this.addStoragePopupToNodeLayer
    );
  }

  addStoragePopupToStorageLayer = ([key, storage]) => {
    const storageNode = this.grid.storages[key];

    const nodeInfo = getPopupNodeInfo(this.grid.nodes, storageNode.bus1);

    storage
      .setIcon(createIcon("storage", "success"))
      .addEventListener("click", () => {
        this.zone.run(() => {
          this.openStoragePopup(nodeInfo, storageNode);
        });
      });
  };

  addStoragePopupToNodeLayer = ([key, node]) => {
    node
      .bindTooltip(key)
      .setIcon(createIcon("house", "selected", [28, 28]))
      .addEventListener("click", () => {
        const nodeInfo = getPopupNodeInfo(this.grid.nodes, key);

        this.zone.run(() => {
          this.openStoragePopup(nodeInfo);
        });
      });
  };

  // ##################################################################################################################
  // PV Methods
  // ##################################################################################################################

  setPvPenetrationLevel({ state, penetrationLevel, backup }) {
    this.toolbox.activateTool(AppSettings.TOOLS.pv);

    if (!state) {
      const { grid, gridElements } = this.dbService.restoreGrid();

      this.grid = grid;
      this.gridElements = gridElements;

      this.createMarkers();
      this.displayData();
    } else {
      if (backup) {
        this.dbService.backupGrid(this.grid, this.gridElements);
      }

      this.removeExistingPVsCreatedForPenetrationLevel();
      this.createPvNodesForPenetration(penetrationLevel);

      this.createMarkers(false);

      Object.entries(this.gridLayer.pvLayer).forEach(this.addPvPopupToPvLayer);

      this.displayData();
    }
  }

  private removeExistingPVsCreatedForPenetrationLevel() {
    Object.values(this.grid.pvs)
      .filter((pv: PV) => pv.tech_id.includes("_4PL"))
      .forEach((pv: PV) => {
        const nodeId = pv.bus1;

        const currentNodeId = cleanNodeId(nodeId);

        let node = this.grid.nodes[currentNodeId];

        if (!node) {
          node = this.grid.virtualNodes[currentNodeId];
        }

        if (!node) return;

        removeConnectedElement(
          node,
          this.grid.pvs,
          this.gridLayer.pvLayer,
          this.gridElements.virtualLines,
          pv
        );
      });
  }

  private createPvNodesForPenetration(penetrationLevel: number) {
    const totalLoadPower = this.getTotalLoadPower();

    const powerToInclude =
      parseFloat(totalLoadPower) * (penetrationLevel / 100);

    const existingPvPower = Object.values(this.grid.pvs).reduce(
      (total: number, pv: PV) => {
        return total + pv.kVA;
      },
      0
    );

    const powerToSetup = powerToInclude - existingPvPower;

    if (powerToSetup <= 0) return;

    const nodesWithoutPV = Object.entries(this.grid.nodes)
      .filter(([_, node]: [string, Node]) => {
        const { hasPV } = nodeContains(node);
        return !hasPV;
      })
      .map(([nodeId, _]) => nodeId);

    const noOfNodes = nodesWithoutPV.length;

    const pvPowerList = getPvPowerListForPowerToSetup(noOfNodes, powerToSetup);

    const nodeIds = _.sampleSize(nodesWithoutPV, pvPowerList.length);

    nodeIds.forEach((nodeId: string, index) => {
      const currentNodeId = cleanNodeId(nodeId);

      const node: Node = this.grid.nodes[currentNodeId];
      const buses = getNodeConnections(node);
      const phases = buses.length;
      const kV = phases === 1 ? 0.23 : 0.4;
      const bus = getBusValue(buses, nodeId);

      const pvId = `pv_${shortid.generate()}_4PL`;

      const { pv, line } = createPV(
        currentNodeId,
        pvId,
        phases,
        bus,
        kV,
        pvPowerList[index]
      );

      addElementToNode(node, pv, this.gridElements.virtualLines, line);
      this.grid = updateConnectedElements(this.grid, currentNodeId, node);

      this.gridStatus = {
        ...this.gridStatus,
        pvStatus: "success"
      };
    });
  }

  private getTotalPvPower(): string {
    return Object.values(this.grid.pvs)
      .reduce<number>((total: number, pv: PV) => {
        return total + pv.kVA;
      }, 0)
      .toFixed(2);
  }

  openPvPopup(nodeInfo: PopupNodeInfo, pv: PV = null, addon: boolean = false) {
    const pvPopupConfig: PopupConfig<PvPopupInputData> = {
      width: "600px",
      maxWidth: "600px",
      data: {
        node: nodeInfo,
        pv
      }
    };

    this.pvPopupRef = this.dialog.open(PvPopupComponent, pvPopupConfig);

    this.pvPopupRef
      .afterClosed()
      .subscribe(({ nodeId, pv, line, deletePv }: PvPopupResult) => {
        if (!nodeId) {
          return;
        }

        const currentNodeId = cleanNodeId(nodeId);

        let node = this.grid.nodes[currentNodeId];

        if (!node) {
          node = this.grid.virtualNodes[currentNodeId];
        }

        if (!node) return;

        if (deletePv) {
          removeConnectedElement(
            node,
            this.grid.pvs,
            this.gridLayer.pvLayer,
            this.gridElements.virtualLines,
            pv
          );
        } else {
          addElementToNode(node, pv, this.gridElements.virtualLines, line);
        }

        this.grid = updateConnectedElements(this.grid, nodeId, node);

        if (!addon) {
          this.gridStatus = {
            ...this.gridStatus,
            pvStatus: "success"
          };
        }

        this.createMarkers(false);

        Object.entries(this.gridLayer.pvLayer).forEach(
          this.addPvPopupToPvLayer
        );

        this.displayData();
      });
  }

  addPvPopupToPvLayer = ([key, pv]) => {
    const pvNode = this.grid.pvs[key];
    const nodeInfo = getPopupNodeInfo(
      this.grid.nodes,
      pvNode.bus1,
      this.grid.virtualNodes
    );
    pv.setIcon(createIcon("pv", "success")).addEventListener("click", () => {
      this.zone.run(() => {
        this.openPvPopup(nodeInfo, pvNode);
      });
    });
  };

  addPvPopupToNodeLayer = ([key, node]) => {
    node
      .bindTooltip(key)
      .setIcon(createIcon("house", "selected", [28, 28]))
      .addEventListener("click", () => {
        const nodeInfo = getPopupNodeInfo(this.grid.nodes, key);

        this.zone.run(() => {
          this.openPvPopup(nodeInfo);
        });
      });
  };

  addPvPopupToVirtualNodeLayer = ([key, node]) => {
    node
      .bindTooltip(key)
      .setRadius(7)
      .setStyle({
        fillColor: statusColorHex("selected"),
        color: statusColorHex("selected")
      })
      .addEventListener("click", () => {
        const nodeInfo = getPopupNodeInfo(this.grid.virtualNodes, key);

        this.zone.run(() => {
          this.openPvPopup(nodeInfo);
        });
      });
  };

  pvClicked() {
    Object.entries(this.gridLayer.pvLayer).forEach(this.addPvPopupToPvLayer);

    Object.entries(this.gridLayer.nodeLayer).forEach(
      this.addPvPopupToNodeLayer
    );

    Object.entries(this.gridLayer.virtualNodeLayer).forEach(
      this.addPvPopupToVirtualNodeLayer
    );
  }

  // ##################################################################################################################
  // Charging Station/EV Methods
  // ##################################################################################################################

  setChargingStationPenetrationLevel({ state, penetrationLevel, backup }) {
    this.toolbox.activateTool(AppSettings.TOOLS.ev);

    if (!state) {
      const { grid, gridElements } = this.dbService.restoreGrid();

      this.grid = grid;
      this.gridElements = gridElements;

      this.createMarkers();
      this.displayData();
    } else {
      if (backup) {
        this.dbService.backupGrid(this.grid, this.gridElements);
      }

      this.removeExistingChargingStationsCreatedForPenetrationLevel();
      this.createChargingStationsForPenetration(penetrationLevel);

      this.createMarkers(false);

      Object.entries(this.gridLayer.chargingStationLayer).forEach(
        this.addChargingStationPopupToChargingStationLayer
      );

      this.displayData();
    }
  }

  private removeExistingChargingStationsCreatedForPenetrationLevel() {
    Object.values(this.grid.chargingStations)
      .filter((chargingStation: ChargingStation) =>
        chargingStation.tech_id.includes("_4PL")
      )
      .forEach((chargingStation: ChargingStation) => {
        const nodeId = chargingStation.bus1;

        const currentNodeId = cleanNodeId(nodeId);

        let node = this.grid.nodes[currentNodeId];

        if (!node) {
          node = this.grid.virtualNodes[currentNodeId];
        }

        if (!node) return;

        removeConnectedElement(
          node,
          this.grid.chargingStations,
          this.gridLayer.chargingStationLayer,
          this.gridElements.virtualLines,
          chargingStation
        );
      });
  }

  private createChargingStationsForPenetration(penetrationLevel: number) {
    const totalLoadPower = this.getTotalLoadPower();

    const powerToInclude =
      parseFloat(totalLoadPower) * (penetrationLevel / 100);

    const existingChargingStationPower = Object.values(
      this.grid.chargingStations
    ).reduce((total: number, chargingStation: ChargingStation) => {
      return total + chargingStation.max_charging_power_kW;
    }, 0);

    const powerToSetup = powerToInclude - existingChargingStationPower;

    if (powerToSetup <= 0) return;

    const nodesWithoutChargingStation = Object.entries(this.grid.nodes)
      .filter(([_, node]: [string, Node]) => {
        const { hasEV } = nodeContains(node);
        return !hasEV;
      })
      .map(([nodeId, _]) => nodeId);

    const noOfNodes = nodesWithoutChargingStation.length;

    const chargingStationPowerList = getChargingStationPowerListForPowerToSetup(
      noOfNodes,
      powerToSetup
    );

    const nodeIds = _.sampleSize(
      nodesWithoutChargingStation,
      chargingStationPowerList.length
    );

    nodeIds.forEach((nodeId: string, index) => {
      const currentNodeId = cleanNodeId(nodeId);

      const node: Node = this.grid.nodes[currentNodeId];
      const buses = getNodeConnections(node);
      const phases = buses.length;
      const kV = phases === 1 ? 0.23 : 0.4;
      const bus = getBusValue(buses, nodeId);

      const id = `charging_station_${shortid.generate()}_4PL`;
      const maxChargingPowerKW = chargingStationPowerList[index];

      const typeApplication = getNodeType(node);

      const { chargingStation, line } = getChargingStationOfGivenPower(
        maxChargingPowerKW,
        currentNodeId,
        kV,
        phases,
        bus,
        typeApplication,
        id
      );

      addElementToNode(
        node,
        chargingStation,
        this.gridElements.virtualLines,
        line
      );

      this.grid = updateConnectedElements(this.grid, currentNodeId, node);

      this.gridStatus = {
        ...this.gridStatus,
        chargingStationStatus: "success"
      };
    });
  }

  openChargingStationPopup(
    nodeInfo: PopupNodeInfo,
    chargingStation: ChargingStation = null
  ) {
    const chargingStationPopupConfig: PopupConfig<EvPopupInputData> = {
      width: "600px",
      maxWidth: "600px",
      data: {
        node: nodeInfo,
        chargingStation
      }
    };

    this.chargingStationPopupRef = this.dialog.open(
      EvPopupComponent,
      chargingStationPopupConfig
    );

    this.chargingStationPopupRef
      .afterClosed()
      .subscribe(
        ({
          nodeId,
          chargingStation,
          line,
          deleteChargingStation
        }: EvPopupResult) => {
          if (!nodeId) {
            return;
          }

          const currentNodeId = cleanNodeId(nodeId);

          let node = this.grid.nodes[currentNodeId];

          if (!node) {
            node = this.grid.virtualNodes[currentNodeId];
          }

          if (!node) return;

          if (deleteChargingStation) {
            removeConnectedElement(
              node,
              this.grid.chargingStations,
              this.gridLayer.chargingStationLayer,
              this.gridElements.virtualLines,
              chargingStation
            );
          } else {
            addElementToNode(
              node,
              chargingStation,
              this.gridElements.virtualLines,
              line
            );
          }

          this.grid = updateConnectedElements(this.grid, nodeId, node);

          this.gridStatus = {
            ...this.gridStatus,
            chargingStationStatus: "success"
          };

          this.createMarkers(false);

          Object.entries(this.gridLayer.chargingStationLayer).forEach(
            this.addChargingStationPopupToChargingStationLayer
          );

          this.displayData();
        }
      );
  }

  addChargingStationPopupToChargingStationLayer = ([key, chargingStation]) => {
    const chargingStationNode = this.grid.chargingStations[key];
    const nodeInfo = getPopupNodeInfo(
      this.grid.nodes,
      chargingStationNode.bus1,
      this.grid.virtualNodes
    );

    chargingStation
      .setIcon(createIcon("ev", "success"))
      .addEventListener("click", () => {
        this.zone.run(() => {
          this.openChargingStationPopup(nodeInfo, chargingStationNode);
        });
      });
  };

  addChargingStationPopupToNodeLayer = ([key, node]) => {
    node
      .bindTooltip(key)
      .setIcon(createIcon("house", "selected", [28, 28]))
      .addEventListener("click", () => {
        const nodeInfo = getPopupNodeInfo(this.grid.nodes, key);

        this.zone.run(() => {
          this.openChargingStationPopup(nodeInfo);
        });
      });
  };

  addChargingStationPopupToVirtualNodeLayer = ([key, node]) => {
    node
      .bindTooltip(key)
      .setRadius(7)
      .setStyle({
        fillColor: statusColorHex("selected"),
        color: statusColorHex("selected")
      })
      .addEventListener("click", () => {
        const nodeInfo = getPopupNodeInfo(this.grid.virtualNodes, key);

        this.zone.run(() => {
          this.openChargingStationPopup(nodeInfo);
        });
      });
  };

  chargingStationClicked() {
    Object.entries(this.gridLayer.chargingStationLayer).forEach(
      this.addChargingStationPopupToChargingStationLayer
    );

    Object.entries(this.gridLayer.nodeLayer).forEach(
      this.addChargingStationPopupToNodeLayer
    );

    Object.entries(this.gridLayer.virtualNodeLayer).forEach(
      this.addChargingStationPopupToVirtualNodeLayer
    );
  }

  // ##################################################################################################################

  toolSelection(activeTool: string) {
    this.simulationStatus = "";
    this.gridStatus = setGridStatus("ready");
    this.createMarkers();
    this.displayData();
    this.errorCount = 0;

    if (activeTool === "explore") {
      this.mapClass = "info-cursor-enabled";
      this.selectMode = false;
      this.markerClusterGroup.removeEventListener("click");
    }

    if (activeTool === "select") {
      this.mapClass = "select-cursor-enabled";
      this.selectMode = true;

      this.createMarkers();
      this.displayData();
    }

    if (activeTool === "storage") {
      this.mapClass = "storage-cursor-enabled";
      this.selectMode = false;

      this.markerClusterGroup.removeEventListener("click");
      this.storageClicked();
    }

    if (activeTool === "pv") {
      this.mapClass = "pv-cursor-enabled";
      this.selectMode = false;

      this.markerClusterGroup.removeEventListener("click");
      this.pvClicked();
    }

    if (activeTool === "ev") {
      this.mapClass = "ev-cursor-enabled";
      this.selectMode = false;

      this.markerClusterGroup.removeEventListener("click");
      this.chargingStationClicked();
    }

    if (activeTool === "house") {
      this.mapClass = "house-cursor-enabled";
      this.selectMode = false;

      this.markerClusterGroup.removeEventListener("click");
      // this.storageClicked();
    }
  }

  private getTotalLoadPower(): string {
    return Object.values(this.grid.loads)
      .reduce<number>((total: number, load: Load) => {
        return total + load.kW;
      }, 0)
      .toFixed(2);
  }

  // ##################################################################################################################
  // Simulation methods
  // ##################################################################################################################

  loadSimulation(results: DbSimulationResults) {
    this.selectMode = false;
    this.markerClusterGroup.removeEventListener("click");

    this.location = results.location;

    this.grid = results.grid;
    this.gridElements = results.gridElements;

    this.createMarkers();

    if (this.map) {
      const [latitude, longitude] = AppSettings.LOCATIONS[
        this.location
      ].coordinate;

      this.map
        .panTo(L.latLng(latitude, longitude))
        .setZoom(leafletOptions.zoom);
    }

    processSimulationResult(
      this.grid,
      this.gridElements,
      this.gridLayer,
      this.gridElementsLayer.lineLayer,
      results.simulationResult
    );

    this.economicEngineResponse = results.simulationResult.economicEngine;

    this.simulationStatus = "complete";

    this.displayData();
  }

  processSimulationResults = (
    result: SimulationResult,
    parameters: SimulationParameters
  ) => {
    this.selectMode = false;
    this.markerClusterGroup.removeEventListener("click");

    processSimulationResult(
      this.grid,
      this.gridElements,
      this.gridLayer,
      this.gridElementsLayer.lineLayer,
      result
    );

    this.economicEngineResponse = result.economicEngine;

    this.simulationStatus = "complete";

    this.dbService.storeGrid(
      this.simulationID,
      this.location,
      this.grid,
      this.gridElements,
      result,
      parameters
    );
  };

  simulationID: string;
  simulationStarted: boolean;
  currentSimulationStatus: number;

  startSimulation(parameters: SimulationParameters) {
    this.simulationStatus = "running";

    this.simulationID = null;
    this.simulationStarted = null;
    this.currentSimulationStatus = null;
    this.simulationErrorMessage = null;
    this.economicEngineResponse = null;

    this.gridService
      .startSimulation(this.grid, this.gridElements, parameters)
      .subscribe((response: ResponseMessage) => {
        const { from } = response;

        switch (from) {
          case "getSimulationID":
            if (response.simulationID === "error") {
              this.simulationErrorMessage =
                "Simulation Engine cannot store grid. Check the Grid validity";
              this.simulationStatus = "error";
              return;
            }
            this.simulationID = response.simulationID;
            break;
          case "startSimulation":
            if (response.info === "error") {
              this.simulationErrorMessage =
                "Simulation Engine cannot start simulation";
              this.simulationStatus = "error";
              return;
            }
            this.simulationStarted =
              response.info === "System started succesfully";
            break;
          case "getSimulationStatus":
            if (response.status === -1) {
              this.simulationErrorMessage = "Cannot get simulation status";
              this.simulationStatus = "error";
              return;
            }
            this.currentSimulationStatus = response.status;
            break;
          case "getResults":
            if (_.isEmpty(response.result)) {
              this.simulationErrorMessage = "Cannot get simulation results";
              this.simulationStatus = "error";
              return;
            }
            this.processSimulationResults(response.result, parameters);
            break;
          default:
            break;
        }
      });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.map.off();
    this.map.remove();
  }
}
