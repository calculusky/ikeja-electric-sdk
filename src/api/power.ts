import * as p from "src/types/power";
import BaseAPI from "./base";
import * as r from "src/types/requester";

export default class PowerAPI extends BaseAPI implements p.IPower {
    async confirmDetails<C extends p.ConfirmationType>(
        options: p.ConfirmDetailsOptions<C>,
    ): Promise<p.GetResponseObject<r.ServiceCode.ConfirmDetails, C>> {
        return await this.send({
            serviceCode: r.ServiceCode.ConfirmDetails,
            jsonRequestBody: options,
        });
    }
}
