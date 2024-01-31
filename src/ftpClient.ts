import * as ftp from "basic-ftp";
import { IFtpClient, UploadFileOptions } from "./types/ftpClient";

export default class FtpClient implements IFtpClient {
    private client: ftp.Client;
    constructor() {
        this.client = new ftp.Client();
    }

    async uploadFile(options: UploadFileOptions) {
        await this.client.access({
            port: options.port,
            host: options.host,
            user: options.username,
            password: options.password,
            secure: true, // Set to true if using FTPS
            //  secureOptions: {}
        });

        return await this.client.uploadFrom(
            options.file,
            options.remoteFilePath,
        );
    }
}
