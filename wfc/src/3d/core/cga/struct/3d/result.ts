export interface DistanceResult {
    closests: Array<any>;
    parameters: Array<any>;
    distance?: number;
    distanceSqr?: number;
    equidistant?: boolean;
    interior?: boolean;
    triangleParameters?: Array<any>;
}

export interface IntersectResult extends DistanceResult {
    interserct?: boolean;
    equals?: boolean
}