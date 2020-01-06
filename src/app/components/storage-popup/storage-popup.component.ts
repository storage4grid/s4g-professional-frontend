import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as _ from 'lodash';
import * as shortid from 'shortid';
import { Storage } from '../../models/storage';
import { Line } from '../../models/line';
import {
  StoragePopupInputData,
  BatteryModels,
  OperationalModes
} from './storage-popup.typings';
import { getBusValue } from '../map/util';
import {
  availableStorageModels,
  availableStorageOperationalModes
} from './storage-models';
import { createStorage } from '../../utils/factories';

@Component({
  selector: 'storage-popup',
  templateUrl: './storage-popup.component.html',
  styleUrls: ['./storage-popup.component.scss']
})
export class StoragePopupComponent {
  objectKeys = Object.keys;

  models: BatteryModels;
  operationalModes: OperationalModes;

  batteryModel: string;

  operationalMode: string;

  globalControl: boolean = false;

  edit = false;

  constructor(
    public dialogRef: MatDialogRef<StoragePopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: StoragePopupInputData = null
  ) {
    this.models = availableStorageModels;

    this.operationalModes = availableStorageOperationalModes;
  }

  ngOnInit(): void {
    const { storage } = this.data;

    if (!!storage) {
      this.batteryModel = storage.model;
      this.operationalMode = storage.operationalMode;
      this.globalControl = storage.global_control;

      this.edit = true;
    }
  }

  submit(edit: boolean) {
    const storageId = edit
      ? this.data.storage.tech_id
      : `storage_${shortid.generate()}`;

    const { buses, kV, phases, tech_id } = this.data.node;

    const bus = getBusValue(buses, tech_id);

    const { storage, line } = createStorage(
      tech_id,
      storageId,
      phases,
      bus,
      kV,
      this.globalControl,
      this.batteryModel,
      this.operationalMode
    );

    this.dialogRef.close({
      nodeId: tech_id,
      storage,
      line,
      deleteStorage: false
    });
  }

  delete() {
    this.dialogRef.close({
      nodeId: this.data.node.tech_id,
      storage: this.data.storage,
      line: undefined,
      deleteStorage: true
    });
  }
}
