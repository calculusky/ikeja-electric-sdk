import { IncomingHttpHeaders, IncomingMessage } from "http";
import {
    IHttpsClient,
    IHttpsClientResponse,
    SendRequestOptions,
} from "./types/httpClient";
import { request } from "http";
import { IkejaElectricError } from "./errors";

export class HttpClient implements IHttpsClient {
    async sendRequest(
        options: SendRequestOptions,
    ): Promise<IHttpsClientResponse> {
        console.log(options, "****************");
        return new Promise((resolve, reject) => {
            const req = request({
                hostname: "restapi.adequateshop.com", //options.hostname,
                path: "/api/Traveler?page=6",
                method: "GET", //options.method,
                headers: options.headers,
                // port: options.port,
            });

            req.on("response", (response: IncomingMessage) => {
                resolve(new HttpsClientResponse(response));
            });
            req.on("error", (error) => {
                reject(error);
            });

            req.write(options.data);

            req.end();
        });
    }
}

class HttpsClientResponse implements IHttpsClientResponse {
    status: number;
    headers: IncomingHttpHeaders;
    data: string;
    error: IkejaElectricError | null;
    constructor(private response: IncomingMessage) {
        this.status = response.statusCode;
        this.headers = response.headers;
        this.buildResponse();
    }

    private buildResponse() {
        let resp = "";
        this.response.setEncoding("utf8");
        this.response.on("data", (chunk) => {
            resp += chunk.toString();
        });

        this.response.on("error", (error) => {
            const err = new IkejaElectricError(
                error.message ?? "Something went wrong",
            );
            err.status = 500;
            err.stack = error.stack;
            this.error = err;
        });
        this.response.on("end", () => {
            if (this.status >= 400) {
                const err = new IkejaElectricError("Something went wrong");
                err.status = this.status;
                this.error = err;
                return this.error;
            }
            this.data = resp;
        });
    }
}
