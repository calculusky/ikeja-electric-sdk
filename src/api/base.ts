import { IRequester, JsonRequestPayload } from "src/types/requester";

export default class BaseAPI {
    constructor(private requester: IRequester) {}

    async send(options: JsonRequestPayload) {
        return await this.requester.sendAPIRequest({
            serviceCode: options.serviceCode,
            jsonRequestBody: options.jsonRequestBody,
        });
    }
}
