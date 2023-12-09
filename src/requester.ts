import { parseBooleans } from "xml2js/lib/processors";
import { IkejaElectricError } from "./errors";
import { RequesterConfig } from "./types/config";
import { IHttpsClient } from "./types/httpClient";
import {
    HeaderBuilderOptions,
    IRequester,
    JsonRequestHeader,
    JsonRequestPayload,
    SignatureBuilderOptions,
} from "./types/requester";
import { Builder, Parser } from "xml2js";
import { createHash } from "crypto";
import * as dayjs from "dayjs";
import * as Util from "./utils";
//import { myXml } from "./test";

export default class Requester implements IRequester {
    private xmlParser: Parser;
    private xmlBuilder: Builder;
    private decodedPassword: string;
    private readonly xmlRootName = "PayWsRequest";
    private readonly xmlRootNameForSignatureBuilder = "data";
    constructor(
        private httpClient: IHttpsClient,
        private config: RequesterConfig,
    ) {
        this.decodedPassword = this.decodeBase64Password();

        this.xmlParser = new Parser({
            trim: true,
            normalize: true,
            explicitRoot: false,
            explicitArray: false,
            ignoreAttrs: true,
            emptyTag: null,
            valueProcessors: [parseBooleans],
        });

        //TODO: test if pretty options set to true with newline works else set pretty to false
        this.xmlBuilder = new Builder({
            rootName: this.xmlRootName,
            headless: false,
        });
    }

    getConfig() {
        return this.config;
    }

    private decodeBase64Password() {
        return atob(this.config.cisPassword);
    }

    private async parseXml(xml: string) {
        return await this.xmlParser.parseStringPromise(xml);
    }

    private buildXml(options: JsonRequestPayload) {
        const header = this.buildJsonHeader({
            serviceCode: options.serviceCode,
            jsonRequestBody: options.jsonRequestBody,
        });
        const jsonRequest = {
            ...header,
            data: options.jsonRequestBody,
        };
        return this.xmlBuilder.buildObject(jsonRequest);
    }

    private buildXmlRequestBodyForSignature(data: Record<string, any>) {
        const builder = new Builder({
            headless: true,
            renderOpts: { pretty: false },
            rootName: this.xmlRootNameForSignatureBuilder,
        });
        return builder.buildObject(data);
    }

    private buildSignature(options: SignatureBuilderOptions) {
        const xmlRequestBody = this.buildXmlRequestBodyForSignature(
            options.jsonRequestBody,
        );
        const dataSequence = `${this.config.appId}${options.serviceCode}${this.decodedPassword}${xmlRequestBody}`;
        return createHash("md5").update(dataSequence).digest("hex");
    }

    private buildMessageId() {
        const randomDigits = Util.generateRandomNumber(4);
        const date = dayjs(new Date()).format("YYYYMMDDHHmmss");
        return `${date}${randomDigits}`;
    }

    private buildJsonHeader(options: HeaderBuilderOptions): JsonRequestHeader {
        const signature = this.buildSignature({
            serviceCode: options.serviceCode,
            jsonRequestBody: options.jsonRequestBody,
        });
        return {
            serviceCode: options.serviceCode,
            msgID: this.buildMessageId(),
            appID: this.config.appId,
            signature: signature,
        };
    }

    async sendAPIRequest(options: JsonRequestPayload) {
        try {
            const xmlData = this.buildXml({
                jsonRequestBody: options.jsonRequestBody,
                serviceCode: options.serviceCode,
            });
            const resp = await this.httpClient.sendRequest({
                hostname: this.config.cisHost,
                method: "POST",
                port: this.config.cisPort,
                headers: {
                    "Content-Type": "application/xml",
                },
                data: xmlData,
            });

            if (resp.error) {
                throw resp.error;
            }
            if (!resp.data) {
                const err = new IkejaElectricError(
                    "Request failed. Please try again",
                );
                err.status = 500;
                throw err;
            }

            const parsedXml = await this.parseXml(resp.data);

            //return the data object
            return parsedXml.data;

            // const parsedXml = await this.parseXml(myXml);
            // return parsedXml.data;
        } catch (error) {
            switch (true) {
                case error instanceof IkejaElectricError: {
                    throw error;
                }

                default: {
                    const err = new IkejaElectricError(
                        error.message ?? "Something went wrong",
                    );
                    err.status = error.status ?? 500;
                    err.stack = error.stack;
                    throw err;
                }
            }
        }
    }
}
