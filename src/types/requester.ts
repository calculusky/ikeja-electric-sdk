import { RequesterConfig } from "./config";

export enum ServiceCode {
    ConfirmDetails = "ConfirmDetails",
    PurchaseCredit = "PurchaseCredit",
    Reprint = "Reprint",
    Acknowledge = "Acknowledge",
    RetrieveDetails = "RetrieveDetails",
    NotifyAutoReconciliation = "NotifyAutoReconciliation",
}

export interface JsonRequestPayload {
    serviceCode: ServiceCode;
    jsonRequestBody: Record<string, any>;
}

export interface SignatureBuilderOptions extends JsonRequestPayload {}

export interface HeaderBuilderOptions extends JsonRequestPayload {}

export interface JsonRequestHeader {
    serviceCode: ServiceCode;
    msgID: string;
    appID: string;
    signature: string;
}

export interface IRequester {
    getConfig(): RequesterConfig;
    sendAPIRequest(options: JsonRequestPayload);
}
