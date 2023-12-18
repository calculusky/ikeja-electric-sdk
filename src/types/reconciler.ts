import { Kind, PaidType } from "./power";
import { FtpResponse } from "./requester";

export type NotifyAutoReconciliationObject = {
    /** Vending client ID, a unique vending client ID assigned to each vending client by CIS system. */
    clientID: string;

    /** Storage path of reconciliation file */
    filePath: string;

    /**
     * Type of reconciliation file:
     * COLLECTION/WITHHOLDING.
     * Only “COLLECTION” is allowed in this phase of project.
     */
    fileType: "COLLECTION";

    /** Name of reconciliation file, for example: UT000011_COLLECTION_20210715.csv */
    fileName: string;
};

// export type NotifyAutoReconciliationOptions = {
//     date?: string;
// };

export type CsvFileBodyContent = {
    /**
     * The unique transaction identifier provided by each vending client. 
       Generation rules: yyyyMMddHHmmssSSS+appID(last 3 digits)+serial number (6 digits) , for example: 20210910093045123001000001
     */
    orderNO: string;

    /** 
     * (POSTPAY/PREPAY)
        Account Payment for Postpaid /Purchase Credit for Prepaid
     */
    kind: Kind;
    /** When “kind” is POSTPAY, this field puts Account No., while PREPAY, then Meter No. */

    requestNO: string;

    /** The total NGN amount of the payment made by the combination of cash, cheque, debit card, credit card, bankteller, etc */
    amountTendered: number;

    /** 
     * cash/cheque/POS /bankteller
       Remarks: POS refers to using credit card or debit card to purchase electricity.
     */
    paidType: PaidType;

    /** Transaction date time. Format: yyyyMMddHHmmss eg 20210917093045 */
    transactionDate: string;

    /** Transaction receipt number eg 210917123457 */
    receiptNO: string;
};

export type CsvFirstRowContent = {
    /** Sum total amount of transactions recorded for the day */
    totalAmount: number;

    /** Total number of transactions recorded for the day */
    totalRecord: number;

    /** Transaction Start Date. Format yyyyMMdd eg 20220713 */
    transactionStartDate: string;

    /** Transaction End Date Format yyyyMMdd eg 20220713 */
    transactionEndDate: string;
};

export type UploadReconciliationFileOptions = {
    /** Trigger auto transaction reconciliation after a successful file upload. Default is true */
    notify?: boolean;
};

export type CSVFileContent = {
    firstRow: CsvFirstRowContent;
    records: CsvFileBodyContent[];
};

export type IReconciler = {
    /**
     * @description
     * Vending clients can initiate reconciliation of payment transactions and notify CIS system to perform reconciliation on a daily basis.
     *
     *   1. After reconciliation file is uploaded to the designated S/FTP server, the vending client needs to initiate a file-uploaded notification by this service, and then CIS system will check the file existence and respond to the vending client.
     *   2. Because automatic reconciliation takes a certain amount of time, each vending client and CIS system will adopt asynchronous and automatic reconciliation to avoid exceptions such as overtime transactions or repeated reconciliation;
     *   3. The automatic reconciliation is subject to the accuracy of the reconciliation file submitted by the vending clients. CIS system performs automatic reconciliation and unilateral transaction processing. System users can query CIS system for the automatic reconciliation results through provided user interfaces, and the failed unilateral transaction processing records can be processed manually.
     *      Unilateral transaction processing rules:
     *      - If vending client has performed transaction successfully, but CIS system has not performed it, CIS system obtains the transaction information from the virtual payment record table and convert it to real payment record;
     *      - If vending client has not performed transaction successfully, but CIS system has performed it successfully, CIS system will perform transaction reversal;
     *   4. Reconciliation file name consists of three parts: vending client ID (clientID), file type, and transaction date. The specific format is: vending client ID_file type_transaction date.csv. The file type is always “COLLECTION” in this phase of project. For example: UT000011_COLLECTION_20210715.csv
     *   5. Vending client only initiates reconciliation service for successful transactions.
     *   6. For the details of the reconciliation file, please strictly refer to section 6.2 Reconciliation File Format.
     *   7. After the reconciliation is successfully completed, CIS system will move the file to the designated backup directory.
     *   8. Vending client must put reconciliation file on FTP and notify SuperEdge by 1:00 am.
     *   9. SuperEdge currently only supports daily reconciliation, that is, Transaction Start Date=Transaction End Date.
     *   10. The transaction time of each record in the reconciliation file must be consistent with the time range in the first row.
     *   11. SuperEdge verifies whether the reconciliation file submitted by the vending client already exists. If it exists and the reconciliation has been completed or is in progress, the reconciliation file submitted repeatedly will not be reconciled.
     *   12. SuperEdge verifies the format of kind, paidType, amount, time and number of records in the reconciliation file and the consistency of Client ID.
     *
     * @param options
     */
    notifyAutoReconciliation(
        notifyObject?: NotifyAutoReconciliationObject,
    ): Promise<boolean>;

    /**
     * @description Upload daily transaction reconciliation file via an ftp client
     * @param dataObject
     * @param options
     */
    uploadReconciliationFile(
        dataObject: CSVFileContent,
        options?: UploadReconciliationFileOptions,
    ): Promise<FtpResponse>;
};
