import { PV } from '../../models/pv';
import { Line, VirtualLine } from '../../models/line';
import { PopupNodeInfo } from '../map/map.typings';

export interface PvPopupResult {
  nodeId: string;
  pv: PV;
  line?: VirtualLine;
  deletePv?: boolean;
}

export interface PvPopupInputData {
  node: PopupNodeInfo;
  pv: PV;
}
