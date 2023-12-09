import BaseAPI from "./base";
import * as r from "../types/requester";
import * as rc from "../types/reconciler";
import * as dayjs from "dayjs";

export class ReconcilerAPI extends BaseAPI implements rc.IReconciler {
    private buildFilePath() {
        return `agent/${this.getConfig().appId}`;
    }

    private buildFileName(dateString?: string) {
        const dateObj = dateString ? new Date(dateString) : new Date();
        const date = dayjs(dateObj).format("YYYYMMDD");
        return `${this.getConfig().appId}_COLLECTION_${date}`;
    }

    private buildReconciliationPayload(
        options: rc.NotifyAutoReconciliationOptions,
    ): rc.NotifyAutoReconciliationObject {
        return {
            clientID: this.getConfig().appId,
            fileType: "COLLECTION",
            filePath: this.buildFilePath(),
            fileName: this.buildFileName(options.date),
        };
    }

    async notifyAutoReconciliation(
        options: rc.NotifyAutoReconciliationOptions,
    ): Promise<boolean> {
        const reconcileOptions = this.buildReconciliationPayload(options);
        return await this.send({
            serviceCode: r.ServiceCode.NotifyAutoReconciliation,
            jsonRequestBody: reconcileOptions,
        });
    }
}
