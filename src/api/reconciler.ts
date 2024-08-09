import BaseAPI from "./base";
import * as r from "../types/requester";
import * as rc from "../types/reconciler";
import * as dayjs from "dayjs";

export class ReconcilerAPI extends BaseAPI implements rc.IReconciler {
    private buildFileUploadPath() {
        if (this.getSDKConfig().mode === "production") {
            return `/${this.getConfig().appId}`;
        }
        return `/Agency/${this.getConfig().appId}`;
    }
    private buildNotifyAutoReconciliationFilePath() {
        if (this.getSDKConfig().mode === "production") {
            return `${this.getConfig().appId}`;
        }
        return `/datadrive/sftp/superedge${this.buildFileUploadPath()}`;
    }

    private buildFileName(options: rc.BuildReconciliationFileNameOptions) {
        const dateObj = dayjs().subtract(1, "day");
        const date = options.date ?? dayjs(dateObj).format("YYYYMMDD");
        return `${this.getConfig().appId}_COLLECTION_${date}.csv`;
    }

    private buildReconciliationPayload(
        options: rc.BuildReconciliationPayload,
    ): rc.NotifyAutoReconciliationObject {
        return {
            clientID: this.getConfig().appId,
            fileType: "COLLECTION",
            filePath: this.buildNotifyAutoReconciliationFilePath(),
            fileName: this.buildFileName({ date: options.date }),
        };
    }

    async notifyAutoReconciliation(
        notifyObject?: rc.NotifyAutoReconciliationObject,
    ): Promise<void> {
        const reconcileOptions = notifyObject
            ? notifyObject
            : this.buildReconciliationPayload({
                  date: notifyObject.date,
              });
        return await this.send({
            serviceCode: r.ServiceCode.NotifyAutoReconciliation,
            jsonRequestBody: reconcileOptions,
        });
    }

    private buildCsvData(buildObj: rc.CSVFileContent) {
        const { firstRow, records } = buildObj;
        const firstRowData = [
            this.getConfig().appId,
            firstRow.totalAmount,
            firstRow.totalRecord,
            firstRow.transactionStartDate,
            firstRow.transactionEndDate,
        ];
        const recordData = records.map((r) => {
            return [
                r.orderNO,
                r.kind,
                r.requestNO,
                r.amountTendered,
                r.paidType,
                r.transactionDate,
                r.receiptNO,
            ];
        });

        return [firstRowData, ...recordData];
    }

    async uploadReconciliationFile(
        dataObject: rc.CSVFileContent,
        options: rc.UploadReconciliationFileOptions,
    ) {
        const notify = options.notify ?? false;
        const remoteFilePath = `${this.buildFileUploadPath()}/${this.buildFileName(
            { date: options.date },
        )}`;
        const csvData = this.buildCsvData(dataObject);
        const uploaded = await this.uploadFile({
            data: csvData,
            remoteFilePath: remoteFilePath,
        });
        if (notify) {
            const notifyOptions = this.buildReconciliationPayload({
                date: options.date,
            });
            await this.notifyAutoReconciliation(notifyOptions);
        }
        return uploaded;
    }
}
