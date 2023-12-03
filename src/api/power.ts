import BaseAPI from "./base";

export default class PowerAPI extends BaseAPI {
    async confirmDetails(options: any) {
        return await this.send(options);
    }
}
