import { RequesterConfig } from "./config";

export enum ServiceCode {
    ConfirmDetails = "ConfirmDetails",
    PurchaseCredit = "PurchaseCredit",
    Reprint = "Reprint",
    Acknowledge = "Acknowledge",
    RetrieveDetails = "RetriveDetails",
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

export type UploadReconciliationFileOptions = {
    data: (string | number)[][];
    remoteFilePath: string;
};

export type SFtpResponse = string;

export interface IRequester {
    getConfig(): RequesterConfig;
    sendAPIRequest(options: JsonRequestPayload): Promise<Record<string, any>>;
    uploadReconciliationFile(
        options: UploadReconciliationFileOptions,
    ): Promise<SFtpResponse>;
}
