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


export interface RegControl { 
    id: string;
    /**
     * ID of the transformer to be connected to
     */
    transformerId: string;
    windingId: string;
    voltageSetting: number;
    bandwidthVolt?: number;
    pTRatio?: number;
    cTPrimaryRatingAmp?: number;
    lineDropCompensatorRVolt?: number;
    lineDropCompensatorXVolt?: number;
}
