type HttpRequestConfig = {
    /** password assigned by server  */
    cisPassword: string;
    /** CIS HTTP Host */
    cisHost: string;
    /** CIS HTTP port */
    cisPort: number;
};

type SftpRequestConfig = {
    /** SFTP Username assigned from server */
    sftpUsername: string;
    /** SFTP password assigned from server */
    sftpPassword: string;
    /** SFTP Host */
    sftpHost: string;
    /** SFTP port */
    sftpPort: number;
};

type IdConfig = {
    /** Identifier allocated to client from server side */
    appId: string;
};

export type IkejaElectricOptions = IdConfig &
    HttpRequestConfig &
    SftpRequestConfig;

export type RequesterConfig = {
    cisHost: string;
    cisPort: number;
    sftpHost: string;
    sftpPort: number;
} & IkejaElectricOptions;

export type SDKSettings = {
    /** Set the environment for the SDK Usage. values: production or development */
    env: "production" | "development";
};
