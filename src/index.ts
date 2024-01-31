import MiscAPI from "./api/misc";
import PowerAPI from "./api/power";
import { ReconcilerAPI } from "./api/reconciler";
import FtpClient from "./ftpClient";
import { HttpClient } from "./httpClient";
import Requester from "./requester";
import { IkejaElectricOptions, SettingOptions } from "./types/config";
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
    constructor(
        protected ikejaElectricOptions: IkejaElectricOptions,
        protected settingsOptions: SettingOptions = { sandbox: false },
    ) {
        const config = Util.buildConfig(
            {
                appId: this.ikejaElectricOptions.appId,
                cisPassword: this.ikejaElectricOptions.cisPassword,
                sftpPassword: this.ikejaElectricOptions.sftpPassword,
                sftpUsername: this.ikejaElectricOptions.sftpUsername,
            },
            settingsOptions,
        );

        const httpClient = new HttpClient();
        const ftpClient = new FtpClient();
        this.requester = new Requester(httpClient, ftpClient, {
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
