/**
 * DSF-SE API
 * Sample version of DSF-SE API for communication with the professional UI
 *
 * OpenAPI spec version: 3
 * Contact: sisay.adugna.chala@fit.fraunhofer.de
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { TransformerRegcontrol } from './transformerRegcontrol';
import { TransformerWdgs } from './transformerWdgs';


export interface Transformer { 
    id: string;
    /**
     * Number of Phases
     */
    phases?: number;
    /**
     * number of windings
     */
    windings?: number;
    kvas?: Array<number>;
    buses?: Array<string>;
    kvs?: Array<number>;
    wdgs?: TransformerWdgs;
    regcontrol?: TransformerRegcontrol;
    /**
     * Percent reactance high-to-low (winding 1 to winding 2)
     */
    xhl?: number;
    /**
     * Percent reactance high-to-low (winding 2 to winding 3)
     */
    xlt?: number;
    /**
     * Percent reactance high-to-low (winding 1 to winding 3)
     */
    xht?: number;
    /**
     * Percent reactance high-to-low (winding 1 to winding 3)
     */
    percentLoadLoss?: number;
    /**
     * Name of the bank this transformer is part of
     */
    bank?: string;
    tapLevel?: number;
    baseFrequency?: number;
}
