export enum TakyMessageType {
  PageMessage = "PAGE_MESSAGE",
}

export interface TakyMessageBase {
  type: TakyMessageType;
}

export interface TakyPermissionMessage {}
