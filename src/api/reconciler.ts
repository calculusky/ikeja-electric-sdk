import BaseAPI from "./base";
import * as r from "../types/requester";
import * as rc from "../types/reconciler";
import * as dayjs from "dayjs";

export class ReconcilerAPI extends BaseAPI implements rc.IReconciler {
    private buildFilePath() {
        return `Agency/${this.getConfig().appId}`;
    }

    private buildFileName() {
        const dateObj = new Date();
        const date = dayjs(dateObj).format("YYYYMMDD");
        return `${this.getConfig().appId}_COLLECTION_${date}.csv`;
    }

    private buildReconciliationPayload(): rc.NotifyAutoReconciliationObject {
        return {
            clientID: this.getConfig().appId,
            fileType: "COLLECTION",
            filePath: this.buildFilePath(),
            fileName: this.buildFileName(),
        };
    }

    async notifyAutoReconciliation(
        notifyObject?: rc.NotifyAutoReconciliationObject,
    ): Promise<boolean> {
        const reconcileOptions = notifyObject
            ? notifyObject
            : this.buildReconciliationPayload();
        return await this.send({
            serviceCode: r.ServiceCode.NotifyAutoReconciliation,
            jsonRequestBody: reconcileOptions,
        });
    }

    private buildCsvData(buildObj: rc.CsvFileContent) {
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
        dataObject: rc.CsvFileContent,
        options: rc.UploadReconciliationFileOptions = { notify: true },
    ) {
        const remoteFilePath = `${this.buildFilePath()}/${this.buildFileName()}`;
        const notifyOptions = this.buildReconciliationPayload();

        const csvData = this.buildCsvData(dataObject);
        const uploaded = await this.uploadFile({
            data: csvData,
            remoteFilePath: remoteFilePath,
        });
        if (options.notify) {
            await this.notifyAutoReconciliation(notifyOptions);
        }
        return uploaded;
    }
}
