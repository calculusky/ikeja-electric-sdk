type HttpRequestConfig = {
    /** password assigned by server  */
    cisPassword: string;
};

type SftpRequestConfig = {
    /** SFTP Username assigned from server */
    sftpUsername: string;
    /** SFTP password assigned from server */
    sftpPassword: string;
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
    sftpPort: number;
} & IkejaElectricOptions;
