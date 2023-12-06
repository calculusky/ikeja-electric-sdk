import { IkejaElectricOptions, RequesterConfig } from "src/types/config";
import * as Config from "../config";

export const buildConfig = (options: IkejaElectricOptions): RequesterConfig => {
    return {
        appId: options.appId,
        cisHost: Config.CIS_HOST,
        cisPassword: options.cisPassword,
        sftpPassword: options.sftpPassword,
        cisPort: Config.CIS_PORT,
        sftpUsername: options.sftpUsername,
        sftpPort: Config.SFTP_PORT,
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

export const convertHashPropValuesToNumber = (
    obj: Record<string, any>,
    keys: string[],
) => {
    return keys.reduce((hash, val) => {
        hash[val] = +hash[val];
        return hash;
    }, obj);
};
