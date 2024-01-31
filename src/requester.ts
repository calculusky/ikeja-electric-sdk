import { parseBooleans } from "xml2js/lib/processors";
import { IkejaElectricError } from "./errors";
import { RequesterConfig } from "./types/config";
import { IHttpsClient } from "./types/httpClient";
import {
    FtpResponse,
    HeaderBuilderOptions,
    IRequester,
    JsonRequestHeader,
    JsonRequestPayload,
    SignatureBuilderOptions,
    UploadReconciliationFileOptions,
} from "./types/requester";
import { Builder, Parser } from "xml2js";
import { createHash } from "crypto";
import * as dayjs from "dayjs";
import * as Util from "./utils";
import { IFtpClient } from "./types/ftpClient";
import { Readable } from "stream";
import { createArrayCsvStringifier } from "csv-writer";

export default class Requester implements IRequester {
    private xmlParser: Parser;
    private xmlBuilder: Builder;
    private decodedPassword: string;
    private readonly xmlRootName = "PayWsRequest";
    private readonly xmlRootNameForSignatureBuilder = "data";
    constructor(
        private httpClient: IHttpsClient,
        private ftpClient: IFtpClient,
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
            headless: true,
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

    private buildSOAPXmlRequest(xmlRequestData: string) {
        return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:lon="http://www.longshine.com">
                    <soapenv:Header/>
                    <soapenv:Body>
                        <lon:service>
                            <requestXml><![CDATA[${xmlRequestData}]]></requestXml>
                        </lon:service>
                    </soapenv:Body>
                </soapenv:Envelope>`;
    }

    private async parseResponseWithList(jsonResponseData: Record<string, any>) {
        const listElement = `<list>${jsonResponseData.list}</list>`;
        const parsedList = await this.parseXml(listElement);
        jsonResponseData.list = parsedList.index;
    }

    async sendAPIRequest(options: JsonRequestPayload) {
        try {
            const xmlRequestData = this.buildXml({
                jsonRequestBody: options.jsonRequestBody,
                serviceCode: options.serviceCode,
            });

            const resp = await this.httpClient.sendRequest({
                hostname: this.config.cisHost,
                method: "POST",
                port: this.config.cisPort,
                path: "/superEdge/services/SuperEdgeService",
                headers: {
                    "Content-Type": "application/xml",
                },
                data: this.buildSOAPXmlRequest(xmlRequestData),
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

            const xmlResponseData = resp.data
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">");

            console.log(xmlResponseData, "*************** RES ************");

            const parsedXml = await this.parseXml(xmlResponseData);

            const jsonResponse =
                parsedXml["soap:Body"]["ns2:serviceResponse"]["return"][
                    "PayWsResponse"
                ];

            if (jsonResponse.returnCode !== "000") {
                const err = new IkejaElectricError(
                    jsonResponse.message ?? "Something went wrong",
                );
                err.status = +jsonResponse.returnCode ?? 500;
                throw err;
            }

            if (jsonResponse.data && jsonResponse.data.list) {
                await this.parseResponseWithList(jsonResponse.data);
            }

            return jsonResponse.data;
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
    async uploadReconciliationFile(
        options: UploadReconciliationFileOptions,
    ): Promise<FtpResponse> {
        try {
            // Create a CSV stringifier
            const csvStringifier = createArrayCsvStringifier({ header: [] });
            const csvString = csvStringifier.stringifyRecords(options.data);

            console.log(this.config);

            // Convert CSV string to readable stream
            const csvStream = Readable.from(csvString);

            const resp = await this.ftpClient.uploadFile({
                host: this.config.sftpHost,
                port: this.config.sftpPort,
                username: this.config.sftpUsername,
                password: this.config.sftpPassword,
                file: csvStream,
                remoteFilePath: options.remoteFilePath,
            });
            return resp;
        } catch (error) {
            const err = new IkejaElectricError(
                error.message ?? "Failed to upload reconciliation file",
            );
            err.status = error.status ?? 500;
            err.stack = error.stack;
            throw err;
        }
    }
}
