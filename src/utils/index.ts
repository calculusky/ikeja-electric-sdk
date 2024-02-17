import { IkejaElectricOptions, RequesterConfig } from "../types/config";

export const buildConfig = (options: IkejaElectricOptions): RequesterConfig => {
    return {
        appId: options.appId,
        cisHost: options.cisHost,
        cisPassword: options.cisPassword,
        sftpPassword: options.sftpPassword,
        cisPort: options.cisPort,
        sftpUsername: options.sftpUsername,
        sftpPort: options.sftpPort,
        sftpHost: options.sftpHost,
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
