import * as r from "../types/requester";
import * as p from "../types/power";
import * as Util from "../utils";
import * as c from "../types/config";

export default class BaseAPI {
    constructor(
        private requester: r.IRequester,
        private settings?: c.SDKSettings,
    ) {}

    protected getConfig() {
        return this.requester.getConfig();
    }

    protected getSDKSettings() {
        return this.settings;
    }

    protected async send<R>(options: r.JsonRequestPayload): Promise<R> {
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
            case r.ServiceCode.PurchaseCredit: {
                return this.normalizePurchaseCredit(
                    options.jsonRequestBody as p.PurchaseCreditOptions<p.Kind>,
                    resp,
                ) as R;
            }
            case r.ServiceCode.Reprint: {
                return this.normalizeReprint(resp) as R;
            }
            case r.ServiceCode.RetrieveDetails: {
                return this.normalizeRetrieveDetails(resp) as R;
            }
            case r.ServiceCode.Acknowledge: {
                return this.normalizeAcknowledge(resp) as R;
            }

            default:
                break;
        }
    }

    private normalizeConfirmDetails<C extends p.ConfirmationType>(
        reqOptions: p.ConfirmDetailsOptions<C>,
        data: Record<string, any>,
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
                Util.objectStringValuesToFloat(data, keys);
                data.minVendBreakdown = data.list;
                delete data.list;
                return data;
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
                Util.objectStringValuesToFloat(data, keys);
                return data;
            }
        }
    }

    private normalizePurchaseCredit<K extends p.Kind>(
        reqOptions: p.PurchaseCreditOptions<K>,
        data: Record<string, any>,
    ) {
        switch (reqOptions.kind) {
            case "PREPAY": {
                const keys = [
                    "orgNO",
                    "dtNO",
                    "rate",
                    "vatRate",
                    "balance",
                    "units",
                    "refund",
                    "walletBalance",
                    "adjustUnits",
                    "presetUnits",
                    "totalUnits",
                    "amountTendered",
                ];
                Util.objectStringValuesToFloat(data, keys);
                data.creditBreakdown = data.list;
                delete data.list;
                return data;
            }

            default: {
                //CN
                const keys = [
                    "payments",
                    "rate",
                    "vatRate",
                    "balance",
                    "walletBalance",
                    "remainingDebt",
                    "outstandingDebt",
                ];
                Util.objectStringValuesToFloat(data, keys);
                data.minVendBreakdown = data.list;
                delete data.list;
                return data;
            }
        }
    }

    private normalizeReprint(data: Record<string, any>) {
        if (!data || !data.list) {
            data = [];
            return data;
        }

        const keys = ["amountTendered"];

        if (!Array.isArray(data.list)) {
            Util.objectStringValuesToFloat(data.list, keys);
            return [data.list];
        }

        const modData = data.list.map((p: any) => {
            return Util.objectStringValuesToFloat(p, keys);
        });
        return modData;
    }

    private normalizeRetrieveDetails(data: Record<string, any>) {
        return this.normalizeReprint(data);
    }

    private normalizeAcknowledge(data: any) {
        if (!data) {
            return true;
        }
        return false;
    }

    protected async uploadFile(options: r.UploadReconciliationFileOptions) {
        return await this.requester.uploadReconciliationFile({
            data: options.data,
            remoteFilePath: options.remoteFilePath,
        });
    }
}
