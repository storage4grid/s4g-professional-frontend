import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as shortid from 'shortid';
import {
  EvPopupInputData,
  ChargingStationModels,
  EvModels
} from './ev-popup.typings';
import * as _ from 'lodash';
import { getBusValue } from '../map/util';
import { createChargingStation } from '../../utils/factories';
import { availableChargingStationModels, availableEvModels } from './ev-models';

@Component({
  selector: 'ev-popup',
  templateUrl: './ev-popup.component.html',
  styleUrls: ['./ev-popup.component.scss']
})
export class EvPopupComponent implements OnInit {
  objectKeys = Object.keys;

  nodeId: string = '';
  chargingStationModels: ChargingStationModels;
  evModels: EvModels;
  typeApplications: string[];

  edit: boolean = false;

  chargingStationModel: string;
  evModel: string;
  typeApplication: string;

  constructor(
    public dialogRef: MatDialogRef<EvPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EvPopupInputData = null
  ) {
    this.chargingStationModels = availableChargingStationModels;

    this.evModels = availableEvModels;

    this.typeApplications = ['residential', 'commercial'];
  }

  ngOnInit() {
    const { chargingStation } = this.data;
    const { tech_id } = this.data.node;
    this.nodeId = tech_id;

    if (!!chargingStation) {
      this.chargingStationModel = chargingStation.model;
      this.evModel = chargingStation.hosted_ev[0].model;
      this.typeApplication = chargingStation.type_application;

      this.edit = true;
    }
  }

  submit(edit: boolean) {
    const chargingStationId = edit
      ? this.data.chargingStation.id
      : `charging_station_${shortid.generate()}`;

    const hostedEvId = edit
      ? this.data.chargingStation.hosted_ev[0].id
      : `ev_${shortid.generate()}`;

    const { kV, phases, tech_id, buses } = this.data.node;

    const bus = getBusValue(buses, tech_id);

    const { chargingStation, line } = createChargingStation(
      tech_id,
      chargingStationId,
      hostedEvId,
      phases,
      bus,
      kV,
      this.typeApplication,
      this.chargingStationModel,
      this.evModel
    );

    if (edit) {
      this.dialogRef.close({
        nodeId: tech_id,
        chargingStation,
        deleteChargingStation: false
      });

      return;
    }

    this.dialogRef.close({
      nodeId: tech_id,
      chargingStation,
      line,
      deleteChargingStation: false
    });
  }

  delete() {
    this.dialogRef.close({
      nodeId: this.data.node.tech_id,
      chargingStation: this.data.chargingStation,
      line: undefined,
      deleteChargingStation: true
    });
  }
}
