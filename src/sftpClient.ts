import { ISFTPClient, UploadFileOptions } from "./types/sftpClient";
import * as Client from "ssh2-sftp-client";

export default class SFTPClient implements ISFTPClient {
    private client: Client;

    constructor() {
        this.client = new Client();
    }

    async uploadFile(options: UploadFileOptions) {
        try {
            await this.client.connect({
                port: options.port,
                host: options.host,
                username: options.username,
                password: options.password,
            });
            return await this.client.put(options.file, options.remoteFilePath);
        } catch (error) {
            throw error;
        } finally {
            await this.client.end();
        }
    }
}
