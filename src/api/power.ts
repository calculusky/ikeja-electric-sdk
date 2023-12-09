import * as p from "../types/power";
import BaseAPI from "./base";
import * as r from "../types/requester";

export default class PowerAPI extends BaseAPI implements p.IPower {
    async confirmDetails<C extends p.ConfirmationType>(
        options: p.ConfirmDetailsOptions<C>,
    ): Promise<p.GetResponseObject<r.ServiceCode.ConfirmDetails, C>> {
        return await this.send({
            serviceCode: r.ServiceCode.ConfirmDetails,
            jsonRequestBody: options,
        });
    }

    async purchaseCredit<K extends p.Kind>(
        options: p.PurchaseCreditOptions<K>,
    ): Promise<
        p.GetResponseObject<r.ServiceCode.PurchaseCredit, undefined, K>
    > {
        return await this.send({
            serviceCode: r.ServiceCode.PurchaseCredit,
            jsonRequestBody: options,
        });
    }

    async reprint<C extends p.ConfirmationType>(
        options: p.ReprintOptions<C>,
    ): Promise<p.GetResponseObject<r.ServiceCode.Reprint, C>[]> {
        return await this.send({
            serviceCode: r.ServiceCode.Reprint,
            jsonRequestBody: options,
        });
    }

    async retrieveDetails(
        options: p.RetrieveDetailsOptions,
    ): Promise<p.GetResponseObject<r.ServiceCode.RetrieveDetails>> {
        return await this.send({
            serviceCode: r.ServiceCode.RetrieveDetails,
            jsonRequestBody: options,
        });
    }

    async acknowledge(
        options: p.AcknowledgementOptions,
    ): Promise<p.GetResponseObject<r.ServiceCode.Acknowledge>> {
        return await this.send({
            serviceCode: r.ServiceCode.Acknowledge,
            jsonRequestBody: options,
        });
    }
}
