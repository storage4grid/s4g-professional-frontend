import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PV } from '../../models/pv';
import * as shortid from 'shortid';
import { Line } from '../../models/line';
import { PvPopupInputData } from './pv-popup.typings';
import { createPV, createLine } from '../../utils/factories';
import { getBusValue } from '../map/util';

interface InputData {
  nodeId: string;
  pv: PV;
}

@Component({
  selector: 'pv-popup',
  templateUrl: './pv-popup.component.html',
  styleUrls: ['./pv-popup.component.scss']
})
export class PvPopupComponent implements OnInit {
  min: number = 1.08;
  max: number = 11.88;
  step: number = 0.27;

  nodeId: string = '';
  maxPowerKW: number = 2.7;
  edit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PvPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: PvPopupInputData = null
  ) {}

  ngOnInit() {
    const { pv } = this.data;
    const { tech_id } = this.data.node;
    this.nodeId = tech_id;

    if (!!pv) {
      this.maxPowerKW = 'max_power_kW' in pv ? pv.max_power_kW : pv.kVA;

      this.edit = true;
    }
  }

  submit(edit: boolean) {
    const pvId = edit ? this.data.pv.tech_id : null;

    const { tech_id: nodeId, kV, phases, buses } = this.data.node;

    const bus = getBusValue(buses, nodeId);

    const { pv, line } = createPV(
      nodeId,
      pvId,
      phases,
      bus,
      kV,
      this.maxPowerKW
    );

    if (edit) {
      this.dialogRef.close({
        nodeId,
        pv,
        deletePv: false
      });

      return;
    }

    this.dialogRef.close({
      nodeId,
      pv,
      line,
      deletePv: false
    });
  }

  delete() {
    const { tech_id: nodeId } = this.data.node;

    this.dialogRef.close({
      nodeId: nodeId,
      pv: this.data.pv,
      line: undefined,
      deletePv: true
    });
  }
}
