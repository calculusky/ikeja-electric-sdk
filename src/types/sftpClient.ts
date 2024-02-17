import { Readable } from "stream";

export type UploadFileOptions = {
    username: string;
    password: string;
    host: string;
    port: number;
    file: Readable;
    remoteFilePath: string;
};

export interface ISFTPClient {
    uploadFile(options: UploadFileOptions): Promise<string>;
}
