import { IMapRegion } from "../store/reducers/mapReducer";

export interface IRegionFromDb {
  info: string;
  uuid: string;
  reloader: () => void;
}

export interface IDataBaseRegionModel {
  id: number;
  uuid: string;
  info: string;
  geo_json: string;
}

export interface IRegionItem {
  layer: any;
  info?: string;
  region_id: number;
  signaler: () => void;
}

export interface IRegion {
  obj: IMapRegion;
}
