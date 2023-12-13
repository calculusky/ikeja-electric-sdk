import { Readable } from "stream";

export type UploadFileOptions = {
    username: string;
    password: string;
    host: string;
    port: number;
    file: Readable;
    remoteFilePath: string;
};

export interface IFtpClient {
    uploadFile(options: UploadFileOptions): Promise<any>;
}
