## Ikeja Electric SDK for Nodejs

The SDK is a light weight package that exposes friendly interface for interacting with Ikeja Electric SOAP API and FTP Servers in your integration. It currently support the below functionalities:

-   **Confirm Details**: Confirm meter number or account number for both prepaid and postpaid customers.
-   **Purchase Credit:** Purchase credit for both prepaid and postpaid customers.
-   **Reprint**: Query for the last 3 valid credit purchase via the account number or meter number.
-   **RetrieveDetails**: Query for the valid credit purchase transactions in a specified time period with 2 days maximum range.
-   **Acknowledge**: Acknowledge either a successful or failed payment transaction from vending client end
-   **Notify Auto Reconciliation:** Notify auto reconciliation after a successful upload of the daily transaction reconciliation file.
-   **Reconciliation File Upload**: Uploads the daily transaction reconciliation file to the FTP server.

## Installation

```shell
pnpm install @calculusky/ikeja-electric-sdk
#or
npm install @calculusky/ikeja-electric-sdk
#or
yarn add @calculusky/ikeja-electric-sdk
```

## Usage

First, obtain your API and FTP credentials and initialize the SDK.

#### Examples

**CommonJS Usage**

Note: In order to gain the TypeScript typings (for intellisense / autocomplete) while using CommonJS, use require().default as seen below:

```js
const IkejaElectric = require("@calculusky/ikeja-electric-sdk").default;
```

**Typescript Usage**

```ts
import IkejaElectric from "@calculusky/ikeja-electric-sdk";

const ie = new IkejaElectric({
    appId: "YOUR_APPID",
    cisPassword: "YOUR_PASSWORD",
    sftpPassword: "YOUR_FTP_PASSWORD",
    sftpUsername: "YOUR_SFTP_USERNAME",
    cisHost: "YOUR_CIS_HTTP_HOST",
    cisPort: "YOUR_CIS_HTTP_PORT",
    sftpHost: "YOUR_SFTP_HOST",
    sftpPort: "YOUR_SFTP_PORT",
});
```

Note: For sandbox environment, set the sandbox option in the second argument of the SDK as seen below.

```ts
const ie = new IkejaElectric(
    {
        appId: "YOUR_APPID",
        cisPassword: "YOUR_PASSWORD",
        sftpPassword: "YOUR_FTP_PASSWORD",
        sftpUsername: "YOUR_FTP_USERNAME",
    },
    { sandbox: true },
);
```

## API

**Confirm Details**

Confirm meter number or account number for a prepaid or postpaid account. This will also retrieve the information associated to the account.

```ts
const details = await ie.power.confirmDetails({
    type: "MN",
    requestNO: "6745548846",
});
console.log(details);
```

**Purchase Credit**

Purchase credit after a successful account confirmation.

```ts
const response = await ie.power.purchaseCredit({
    kind: "PREPAY",
    accountType: "MD",
    amountTendered: 45000,
    orderNO: "20210910093045123001000001",
    paidType: "POS",
    requestNO: "6745548846",
});
console.log(response);
```

**Reprint**

```ts
const data = await ie.power.reprint({
    type: "MN",
    requestNO: "6745548846",
    orderNO: "20210910093045123001000001", //optional
});

console.log(data);
```

**Retrieve Details**
Retrieve transaction details

```ts
const result = await ie.power.retrieveDetails({
    beginDate: "20210905",
    endDate: "20210906",
    orderNO: "20210910093045123001000001",
});

console.log(result);
```

**Acknowledge**

```ts
await ie.power.acknowledge({
    amountTendered: 45000,
    orderNO: "20210910093045123001000001",
    purchaseStatus: "SUCCESS",
    receiptNO: "210918123456",
});
```

**Upload reconciliation file**

This method provides the interface to upload reconciliation file to the sftp server. It also has a notify option. When the notify option is set, the interface automatically triggers the notify-auto-reconciliation service after a successful file upload. Default is false.

```ts
  const response = await ie.reconciler.uploadReconciliationFile({
            firstRow: {
                totalAmount: 8500,
                totalRecord: 5,
                transactionStartDate: "20220717",
                transactionEndDate: "20220717",
            },
            records: [
                {
                    amountTendered: 2000,
                    kind: "PREPAY",
                    orderNO: "20210910093045123001000001",
                    paidType: "POS",
                    receiptNO: "210918123456",
                    requestNO: "6745548846",
                    transactionDate: "20210917093045",
                },
                ...
            ],
       }, { notify: true },);

        console.log(response)
```

**Notify Auto Reconciliation**

This method provides the functionality to manually notify the CIS Server after a successful reconciliation file upload.
Note: This method is called immediately after the uploadReconciliationFile method runs with the notify options set to false.

```ts
await ie.reconciler.notifyAutoReconciliation();
```
