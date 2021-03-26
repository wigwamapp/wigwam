export enum IntercomMessageType {
  Req = "INTERCOM_REQUEST",
  Res = "INTERCOM_RESPONSE",
  Err = "INTERCOM_ERROR",
  OneWay = "INTERCOM_ONE_WAY",
}

export type IntercomClientMessage = IntercomRequest | IntercomOneWay;

export type IntercomServerMessage =
  | IntercomResponse
  | IntercomErrorResponse
  | IntercomOneWay;

export interface IntercomMessageBase {
  type: IntercomMessageType;
  data: any;
}

export interface IntercomReqResBase extends IntercomMessageBase {
  type:
    | IntercomMessageType.Req
    | IntercomMessageType.Res
    | IntercomMessageType.Err;
  reqId: number;
}

export interface IntercomRequest extends IntercomReqResBase {
  type: IntercomMessageType.Req;
}

export interface IntercomResponse extends IntercomReqResBase {
  type: IntercomMessageType.Res;
}

export interface IntercomErrorResponse extends IntercomReqResBase {
  type: IntercomMessageType.Err;
}

export interface IntercomOneWay extends IntercomMessageBase {
  type: IntercomMessageType.OneWay;
}
