import PowerAPI from "./api/power";
import { HttpClient } from "./httpClient";
import Requester from "./requester";
import { IkejaElectricOptions } from "./types/config";
import * as Util from "./utils";

export default class IkejaElectric {
    readonly power: PowerAPI;
    private requester: Requester;
    constructor(protected ikejaElectricOptions: IkejaElectricOptions) {
        const config = Util.buildConfig({
            appId: this.ikejaElectricOptions.appId,
            cisPassword: this.ikejaElectricOptions.cisPassword,
            sftpPassword: this.ikejaElectricOptions.sftpPassword,
            sftpUsername: this.ikejaElectricOptions.sftpUsername,
        });

        const client = new HttpClient();
        this.requester = new Requester(client, {
            appId: config.appId,
            cisHost: config.cisHost,
            cisPassword: config.cisPassword,
            cisPort: config.cisPort,
            sftpPassword: config.sftpPassword,
            sftpPort: config.sftpPort,
            sftpUsername: config.sftpUsername,
        });

        this.power = new PowerAPI(this.requester);
    }
}
