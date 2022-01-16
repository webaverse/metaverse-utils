export interface ResultDistance {
    distance?: number;
    distanceSqr?: number;
    parameters?: any[];
    closests?: any[];
    signedDistance?: number;//需要符号距离正负距离
    segmentIndex?: number;//Ployline
}