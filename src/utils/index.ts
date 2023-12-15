import {
    IkejaElectricOptions,
    RequesterConfig,
    SettingOptions,
} from "../types/config";
import * as Config from "../config";

export const buildConfig = (
    options: IkejaElectricOptions,
    settingsOptions?: SettingOptions,
): RequesterConfig => {
    return {
        appId: options.appId,
        cisHost: settingsOptions.sandbox
            ? Config.SANDBOX_CIS_HOST
            : Config.CIS_HOST,
        cisPassword: options.cisPassword,
        sftpPassword: options.sftpPassword,
        cisPort: settingsOptions.sandbox
            ? Config.SANDBOX_CIS_PORT
            : Config.CIS_PORT,
        sftpUsername: options.sftpUsername,
        sftpPort: settingsOptions.sandbox
            ? Config.SANDBOX_SFTP_PORT
            : Config.SFTP_PORT,
        sftpHost: settingsOptions.sandbox
            ? Config.SANDBOX_SFTP_HOST
            : Config.SFTP_HOST,
    };
};

export const generateRandomNumber = (size: number): string => {
    let str = "";
    for (let i = 0; i < size; i++) {
        const rand = Math.floor(Math.random() * 10);
        str += rand;
    }
    return str;
};

export const objectStringValuesToFloat = (
    obj: Record<string, any>,
    keys: string[],
) => {
    return keys.reduce((hash, val) => {
        hash[val] = parseFloat(hash[val]);
        return hash;
    }, obj);
};
