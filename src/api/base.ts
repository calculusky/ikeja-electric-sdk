import * as r from "src/types/requester";
import * as p from "src/types/power";
import * as Util from "../utils";

export default class BaseAPI {
    constructor(private requester: r.IRequester) {}

    private normalizeConfirmDetails<C extends p.ConfirmationType>(
        reqOptions: p.ConfirmDetailsOptions<C>,
        resp: Record<string, any>,
    ) {
        switch (reqOptions.type) {
            case "MN": {
                const keys = [
                    "orgNO",
                    "dtNO",
                    "rate",
                    "vatRate",
                    "balance",
                    "arrears",
                    "refund",
                    "adjustUnits",
                    "presetUnits",
                    "minimumVend",
                ];
                Util.convertHashPropValuesToNumber(resp, keys);
                resp.minVendBreakdown = resp.list?.index;
                return resp;
            }

            default: {
                //CN
                const keys = [
                    "dtNO",
                    "rate",
                    "vatRate",
                    "balance",
                    "orgNO",
                    "outstandingDebt",
                ];
                Util.convertHashPropValuesToNumber(resp, keys);
                resp.minVendBreakdown = resp.list?.index;
                return resp;
            }
        }
    }

    async send<R>(options: r.JsonRequestPayload): Promise<R> {
        const resp = await this.requester.sendAPIRequest({
            serviceCode: options.serviceCode,
            jsonRequestBody: options.jsonRequestBody,
        });

        switch (options.serviceCode) {
            case r.ServiceCode.ConfirmDetails: {
                return this.normalizeConfirmDetails(
                    options.jsonRequestBody as p.ConfirmDetailsOptions<p.ConfirmationType>,
                    resp,
                ) as R;
            }

            default:
                break;
        }
    }
}
