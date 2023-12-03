import { IncomingHttpHeaders } from "http";
import { IkejaElectricError } from "src/errors";

export type HttpMethod = "POST";

export type HttpHeaders = {
    "Content-Type": "application/xml";
};
export interface SendRequestOptions {
    hostname: string;
    port: number;
    method: HttpMethod;
    headers: HttpHeaders;
    data: string;
}

export interface IHttpsClient {
    sendRequest(options: SendRequestOptions): Promise<IHttpsClientResponse>;
}

export type IHttpsClientResponse = {
    status: number;
    headers: IncomingHttpHeaders;
    error: IkejaElectricError | null;
    data: string;
};
