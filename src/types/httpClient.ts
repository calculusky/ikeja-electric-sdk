export type HttpMethod = "POST";

type HttpHeaders = {
    "Content-Type": "application/xml";
};
export interface SendRequestOptions {
    hostname: string;
    port: number;
    method: HttpMethod;
    headers: HttpHeaders;
    data: Record<string, any>;
}
