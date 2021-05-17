export enum PorterMessageType {
  Req = "PORTER_REQUEST",
  Res = "PORTER_RESPONSE",
  Err = "PORTER_ERROR",
  OneWay = "PORTER_ONE_WAY",
}

export type PorterClientMessage = PorterRequest | PorterOneWay;

export type PorterServerMessage =
  | PorterResponse
  | PorterErrorResponse
  | PorterOneWay;

export interface PorterMessageBase {
  type: PorterMessageType;
  data: any;
}

export interface PorterReqResBase extends PorterMessageBase {
  type: PorterMessageType.Req | PorterMessageType.Res | PorterMessageType.Err;
  reqId: number;
}

export interface PorterRequest extends PorterReqResBase {
  type: PorterMessageType.Req;
}

export interface PorterResponse extends PorterReqResBase {
  type: PorterMessageType.Res;
}

export interface PorterErrorResponse extends PorterReqResBase {
  type: PorterMessageType.Err;
}

export interface PorterOneWay extends PorterMessageBase {
  type: PorterMessageType.OneWay;
}
