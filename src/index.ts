import MiscAPI from "./api/misc";
import PowerAPI from "./api/power";
import { ReconcilerAPI } from "./api/reconciler";
import SFtpClient from "./sftpClient";
import { HttpClient } from "./httpClient";
import Requester from "./requester";
import { IkejaElectricOptions } from "./types/config";
import { IMisc } from "./types/misc";
import { IPower } from "./types/power";
import { IReconciler } from "./types/reconciler";
import * as Util from "./utils";
export * from "./errors";
export { IkejaElectricOptions } from "./types/config";
export {
    CSVFileContent,
    CsvFileBodyContent,
    CsvFirstRowContent,
} from "./types/reconciler";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; //TODO: handle cert

export default class IkejaElectric {
    readonly power: IPower;
    readonly reconciler: IReconciler;
    readonly misc: IMisc;
    private requester: Requester;
    constructor(protected ikejaElectricOptions: IkejaElectricOptions) {
        const config = Util.buildConfig({
            appId: ikejaElectricOptions.appId,
            cisPassword: ikejaElectricOptions.cisPassword,
            sftpPassword: ikejaElectricOptions.sftpPassword,
            sftpUsername: ikejaElectricOptions.sftpUsername,
            cisHost: ikejaElectricOptions.cisHost,
            cisPort: ikejaElectricOptions.cisPort,
            sftpHost: ikejaElectricOptions.sftpHost,
            sftpPort: ikejaElectricOptions.sftpPort,
        });

        const httpClient = new HttpClient();
        const sftpClient = new SFtpClient();
        this.requester = new Requester(httpClient, sftpClient, {
            appId: config.appId,
            cisHost: config.cisHost,
            cisPassword: config.cisPassword,
            cisPort: config.cisPort,
            sftpPassword: config.sftpPassword,
            sftpPort: config.sftpPort,
            sftpUsername: config.sftpUsername,
            sftpHost: config.sftpHost,
        });

        this.power = new PowerAPI(this.requester);
        this.reconciler = new ReconcilerAPI(this.requester);
        this.misc = new MiscAPI(this.requester);
    }
}
