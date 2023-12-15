import { Optional } from ".";
import { ServiceCode } from "./requester";

export type ConfirmationType = "MN" | "CN";
type AccountType = "MD" | "NMD";
export type Kind = "POSTPAY" | "PREPAY";
export type PaidType = "bankteller" | "cash" | "cheque" | "POS";
type PaymentStatus = "SUCCESS" | "FAILED";

type CustomerBasicDetailObject = {
    /** Account number generated by CIS system and allocated to each customer. */
    accountNO: string;
    /**
     * MD/NMD.
       MD refers to maximum demand customer, while NMD refers to non-maximum demand customer
     */
    accountType: AccountType;

    /** Name of the customer */
    name: string;

    /** Service address of the customer */
    serviceAddress: string;

    /** Mobile phone number of the customer */
    mobilePhone: string;
};

type CustomerOrganizationObject = {
    /** Number of organization (UT only) which the customer belongs to */
    orgNO: number;
    /** Name of the organization which the customer belongs to */
    orgName: string;
};

type MeterObject = {
    /** Meter number of the customer */
    meterSerialNO: string;

    /** Manufacturer of the prepaid meter */
    manuf: string;

    /** Model of the prepaid meter */
    model: string;
};

type TransformerObject = {
    /** Number of DT (Distribution Transformer) which the customer belongs to */
    dtNO: number;
    /** Name of the DT which the customer belongs to */
    dtName: string;
};

type FeederObject = {
    /** Name of feeder band which the customer belongs to */
    feederBand: string;

    /** Name of feeder which the customer belongs to */
    feederName: string;
};

type TariffObject = {
    /** Name of tariff contracted between Ikeja electric and the customer */
    tariffName: string;

    /** Consumption rate of tariff contracted between Ikeja electric and the customer */
    rate: number;

    /** VAT rate of tariff contracted between Ikeja electric and the customer */
    vatRate: number;
};

type UnitObject = {
    /** Electricity units adjusted for the customer by the system */
    adjustUnits: number;

    /** Electricity units which is preset into the prepaid meter before connected to the grid */
    presetUnits: number;

    /**
     * Electricity units to be issued into the prepaid meter of the customer with TOKEN.
       (totalUnits=units + adjustUnit – presetUnit)
     */
    totalUnits: number;

    /** Electricity Units purchased with tendered amount. */
    units: number;
};

/**
 * 1. costOfUnit: Consumption units cost included in the minimum vend amount
 * 2. vat: VAT cost included in the minimum vend amount
 * 3. fixedCharge: Fixed charge included in the minimum vend amount. Currently the fixed amount is always 0.00.
 * 4. outstandingDebt: Historical arrears, a type of energy fee
 * 5. lor: Revenue loss, a type of energy fee
 * 6. currentCharge: Arrears generated from the last bill, a type of energy fee
 * 7. msc: Meter service charge, a type of business fee but energy payment
 * 8. installationFee: Meter installation fee, a type of business service fee
 * 9. meterCost: Meter cost, a type of business service fee
 * 10. reconnectionFee: Reconnection fee, a type of business service fee
 * 11. administrativeCharge: Administrative charge, a type of business service fee
 * 12. penalty: Penalty normally caused by unauthorized power usage or connection, a business service fee
 */
type FeeType =
    | "costOfUnit"
    | "vat"
    | "fixedCharge"
    | "outstandingDebt"
    | "lor"
    | "currentCharge"
    | "msc"
    | "installationFee"
    | "meterCost"
    | "reconnectionFee"
    | "administrativeCharge"
    | "penalty";

type MappedFeeType = {
    [K in FeeType]: {
        feederType: K;
        feeAmount: number;
    };
}[FeeType][];

export type ConfirmDetailsOptions<T extends ConfirmationType> = {
    /**
     * Confirmation type: CN/MN.
        CN refers to customer account number (Account No.), while MN refers to meter number (Meter No.)
     */
    type: T;

    /**
     * When confirmation type is CN, this field puts Account No., while MN, this field puts Meter No.
     */
    requestNO: string;
};

type ConfirmDetailsPrePaidResponseObject = {
    /** Remaining balance of the customer account. */
    balance: number;
    /** Outstanding debts of the customer account */
    arrears: number;
    /** Money refunded to the customer */
    refund: number;

    /**
     * Minimum amount which should be paid by the customer when vending.
       1. When adjusted unit > 0, calculation formula: (Preset unit + 0.1kWh) * Tariff Rate + VAT + Arrears (Instalment) – Credit(Balance)
       2. When adjusted unit < 0; calculation formula: (Preset Unit - Adjusted Power + 0.1kWh) * Tariff Rate + VAT + Arrears (Instalment) - Credit(Balance)
       Note: The preset unit for the second credit purchase is 0.
     */
    minimumVend: number;
    minVendBreakdown: MappedFeeType;
} & Optional<CustomerBasicDetailObject, "mobilePhone"> &
    CustomerOrganizationObject &
    Omit<MeterObject, "model" | "manuf"> &
    TransformerObject &
    Partial<FeederObject> &
    TariffObject &
    Omit<UnitObject, "units" | "totalUnits">;

type ConfirmDetailsPostpaidResponseObject = {
    /** Remaining balance of the customer account. */
    balance: number;
    /** Outstanding debts of the customer account */
    outstandingDebt: number;
} & CustomerBasicDetailObject &
    CustomerOrganizationObject &
    TransformerObject &
    TariffObject;

//purchase credit
export type PurchaseCreditOptions<K extends Kind> = {
    /**
     * The unique transaction identifier provided by each vending client. 
       Generation rules: yyyyMMddHHmmssSSS+appID(last 3 digits)+serial number (6 digits) , for example: 20210910093045123001000001
     */
    orderNO: string;
    /** 
     * (POSTPAY/PREPAY)
        Account Payment for Postpaid /Purchase Credit for Prepaid
     */
    kind: K;
    /** When “kind” is POSTPAY, this field puts Account No., while PREPAY, then Meter No. */
    requestNO: string;
    /**
     * MD/NMD
       MD refers to maximum demand customer, while NMD refers to non-maximum demand customer.
     */
    accountType: AccountType;

    /** The total NGN amount of the payment made by the combination of cash, cheque, debit card, credit card, bankteller, etc */
    amountTendered: number;

    /** 
     * cash/cheque/POS /bankteller
       Remarks: POS refers to using credit card or debit card to purchase electricity.
     */
    paidType: PaidType;
};

export type PurchaseCreditPrepaidResponseObject = {
    /** Successful payment identifier generated by CIS business system. The third-party vending client can determine the payment is successful in CIS business system if this field is obtained. */
    receiptNO: string;

    /** Transaction date with format yyyyMMddHHmmss, for example 20210902120534 */
    transactionDate: string;

    /** TOKEN with electricity units to be issued into the prepaid meter of the customer */
    token: string;

    /** The total NGN amount of the payment made by the combination of cash, cheque, debit card, credit card, bankteller, etc */
    amountTendered: number;

    /** Remaining balance of the customer account. */
    balance: number;

    /** Money refunded to the customer */
    refund: number;

    /** Two key change tokens will be returned to the customer when customer purchases credit for the first time. The tokens are separated by comma. */
    kct?: string;

    /** Breakdown list of credit purchased by the customer */
    creditBreakdown: MappedFeeType;

    /** The remaining amount of the wallet client in the CIS system. It will be returned when the client is a wallet client. If non-wallet client, it is not returned. */
    walletBalance: number;

    /** SGC number that CIS system is using to generate credit TOKEN. */
    sgc: string;
} & UnitObject &
    Optional<CustomerBasicDetailObject, "mobilePhone"> &
    CustomerOrganizationObject &
    MeterObject &
    TransformerObject &
    Partial<FeederObject> &
    TariffObject &
    UnitObject;

export type PurchaseCreditPostpaidResponseObject = {
    /** Successful payment identifier generated by CIS business system. The third-party vending client can determine the payment is successful in CIS business system if this field is obtained. */
    receiptNO: string;

    /** The total NGN amount of the payment made by the combination of cash, cheque, debit card, credit card, bankteller, etc. */
    payments: number;

    /** Historical arrears, including the bill of current month, to be paid by the customer */
    outstandingDebt: number;

    /** Remaining historical arrears to be paid by the customer */
    remainingDebt: number;

    /** Remaining balance of the customer account. */
    balance: number;

    /** Payment transaction date with format yyyyMMddHHmmss, for example 20210902120534 */
    paymentDate: string;

    /** The remaining amount of the wallet client in the CIS system. It will be returned when the client is a wallet client. If non-wallet client, it is not returned. */
    walletBalance: number;
} & TariffObject &
    CustomerBasicDetailObject;

export type ReprintOptions<C extends ConfirmationType> = {
    /**
     *  Confirmation type: CN/MN. CN refers to customer account number (Account No.), while MN refers to meter number (Meter No.)
     */
    type: C;

    /** When confirmation type is CN, this field puts Account No., while MN, this field puts Meter No. */
    requestNO: string;

    /**
     *  The unique transaction identifier for a particular payment order provided by each vending client.
     *  Generation rules: yyyyMMddHHmmssSSS+appId(last 3 digits)+serial number (6 digits) , for example: 20210910093045123001000001
     */
    orderNO?: string;
};

export type ReprintResponseObject<C extends ConfirmationType> = {
    /** Invoked service name, for example, PurchaseCredit */
    serviceCode: ServiceCode;

    /** Transaction date with format yyyyMMddHHmmss, for example 20210902120534 */
    transactionDate: string;

    /** Successful payment identifier generated by CIS business system.  */
    receiptNO: string;

    /** The total NGN amount of the payment made by the combination of cash, cheque, debit card, credit card, bankteller, etc. */
    amountTendered: number;

    /** TOKEN with electricity units issued into the prepaid meter of the customer. It is null if the customer is postpaid customer. */
    token: C extends "MN" ? string : null;

    /**
     * Two key change tokens issued into the prepaid meter of the customer. The tokens are separated by comma.
     * It is null if the customer is postpaid customer or the transaction is not the first time of credit purchase.
     */
    kct?: string;

    /** Meter number of the customer. It is null if the customer is postpaid customer. */
    meterSerialNO: C extends "MN" ? string : null;
} & Optional<CustomerBasicDetailObject, "mobilePhone">;

export type RetrieveDetailsOptions = {
    /** Begin date of transaction details query. Eg format: yyyyMMdd, 20210905  */
    beginDate: string;

    /** End date of transaction details query. Eg format:  yyyyMMdd, 20210906 */
    endDate: string;

    /** The unique transaction identifier for a particular payment order provided by each vending client. 
        Generation rules: yyyyMMddHHmmssSSS+appID(last 3 digits)+serial number (6 digits) , for example: 20210910093045123001000001 */
    orderNO: string;
};

export type RetrieveDetailsResponseObject = {
    /** Invoked service name, for example, PurchaseCredit */
    serviceCode: ServiceCode;

    /** The total NGN amount of the payment made by the combination of cash, cheque, debit card, credit card, bankteller, etc. */
    amountTendered: number;

    /** Transaction date with format yyyyMMddHHmmss, for example 20210902120534 */
    transactionDate: string;

    /** Order number generated by the vending client for this transaction */
    orderNO: string;

    /** Successful payment identifier generated by CIS business system for this transaction.  */
    receiptNO: string;

    /** TOKEN with electricity units issued into the prepaid meter of the customer.
     * It is null if the customer is postpaid customer. */
    token?: string;

    /** Two key change tokens issued into the prepaid meter of the customer. The tokens are separated by comma.
     * It is null if the customer is postpaid customer or the transaction is not the first time of credit purchase. */
    kct?: string;
} & Optional<CustomerBasicDetailObject, "mobilePhone">;

export type AcknowledgementOptions = {
    /**
     * The unique transaction identifier provided by each vending client.
     * Generation rules: yyyyMMddHHmmssSSS+appID(last 3 digits)+serial number (6 digits) , for example: 20210910093045123001000001
     */
    orderNO: string;

    /**
     * The unique transaction identifier of CIS system. CIS system performs consistence check based on this field. If the received receipt number is inconsistent with the  order number, CIS system will not formally convert the pending record but return an error.
     * When purchaseStatus=SUCCESS, this field is mandatory.
     */
    receiptNO: string;

    /**
     * The total NGN amount of the payment made by the combination of cash, cheque, debit card, credit card, bankteller, etc.
     * CIS system performs consistence check based on this field. If the received tendered amount is inconsistent with the receipt number, CIS system will not formally convert the pending record but return an error.
     */
    amountTendered: number;

    /**
     * SUCCESS/FAILED,
     * CIS system updates the payment status in the payment virtual table according to this flag, and the successful transaction will be officially converted into real one.
     */
    purchaseStatus: PaymentStatus;
};

type GetResponseWithConditionObject<T extends ConfirmationType | Kind> =
    T extends keyof ResponseWithConditionObjectMap
        ? ResponseWithConditionObjectMap[T]
        : never;

type ResponseWithConditionObjectMap = {
    MN: ConfirmDetailsPrePaidResponseObject;
    CN: ConfirmDetailsPostpaidResponseObject;
    PREPAY: PurchaseCreditPrepaidResponseObject;
    POSTPAY: PurchaseCreditPostpaidResponseObject;
};

export type GetResponseObject<
    S extends ServiceCode,
    C extends ConfirmationType = ConfirmationType,
    K extends Kind = Kind,
> = S extends keyof ResponseObjectMap<C, K>
    ? ResponseObjectMap<C, K>[S]
    : never;

type ResponseObjectMap<
    // R extends ConfirmationType | Kind = ConfirmationType,
    C extends ConfirmationType = ConfirmationType,
    K extends Kind = Kind,
> = {
    [ServiceCode.ConfirmDetails]: GetResponseWithConditionObject<C>;
    [ServiceCode.PurchaseCredit]: GetResponseWithConditionObject<K>;
    [ServiceCode.Reprint]: ReprintResponseObject<C>;
    [ServiceCode.RetrieveDetails]: RetrieveDetailsResponseObject;
    [ServiceCode.Acknowledge]: boolean;
};

export interface IPower {
    /**
     * @description Customers can enter the account number or meter number through a third-party collection agency to query the CIS system for their arrears and minimum vend amount information. The breakdown of minimum vend amount is given for the convenience of prepaid customer to purchase credit. Additionally, the basic information of the vending customer is also provided by the interface, including account number, name, address, mobile phone, meter number, arrear information etc
     * @param options
     */
    confirmDetails<C extends ConfirmationType>(
        options: ConfirmDetailsOptions<C>,
    ): Promise<GetResponseObject<ServiceCode.ConfirmDetails, C>>;

    /**
     * @description
     * 1. Prepaid customer is required to purchase credit by Meter No. but not Account No.
     * 2. Postpaid customer is required to input Account No. to make a payment.
     * 3. A virtual payment record is created after the request of credit purchase is received by CIS business system, and returned to the client. CIS business system will generate a formal payment record based on the virtual one after the vending client has notified CIS business system the payment status. For details of the payment notification, please refer to the interface Acknowledge.
     * 4. CIS system will freeze the same tendered amount from the wallet of the wallet client if the transaction is coming from a wallet client.
     * 5. CIS system needs to check whether the vending client is authorized to vend to the customer or not.
     * 6. CIS system needs to check whether the wallet vending client has enough available balance to vend or not.
     * @param options
     */
    purchaseCredit<K extends Kind>(
        options: PurchaseCreditOptions<K>,
    ): Promise<GetResponseObject<ServiceCode.PurchaseCredit, undefined, K>>;

    /**
     * @description
     *  - Customers can query CIS system for the last 3 valid credit purchase transactions via their Account No. or Meter No. All transactions will be returned if the number of transactions is less than 3.
     *  - Customers are allowed to query transaction information based on the order number generated in the PurchaseCredit service by the vending client.
     *  - Virtual/non-acknowledged payment records that have not been officially turned into real payment records by CIS system will not be returned.
     *  - If the input parameter orderNO is not empty, the system will query the particular transaction information based on this order number. The system needs to verify the consistency of the orderNO and the request number (requestNO, such as meter number or account number). If they are inconsistent, the query result will not be returned. If orderNO is not empty but does not exist, the system returns blank record. If orderNO is empty, the last 3 valid payment transaction records should be returned.
     *
     * @param options
     */
    reprint<C extends ConfirmationType>(
        options: ReprintOptions<C>,
    ): Promise<GetResponseObject<ServiceCode.Reprint, C>[]>;

    /**
     * @description
     * - Third-party vending clients can query CIS system for the valid credit purchase transactions in a specified time period.
     * - Third-party vending clients are allowed to query transaction information based on the order number generated in the PurchaseCredit service by the vending client.
     * 1. The time range of transaction details query shall be within 2 days, e.g. 2021-9-18 to 2021-9-19, which cannot exceed 2 days.
     * 2. Only credit purchase transactions will be returned by the interface RetrieveDetails. Query Transactions will not be returned, such as ConfirmDetails.
     * 3. Virtual/non-acknowledged payment records that have not been officially turned into real payment records by CIS system will not be returned.
     * 4. If the input parameter orderNO is not empty, the system will query the particular transaction information based on this order number. The system needs to verify whether orderNO is consistent with the given time range or not. If the transaction time of the order is not within the given time range, the system will not return the query result. If orderNO is not empty but does not exist, the system returns blank record. If orderNO is empty, the payment transaction records within the given time range should be returned.
     *
     * @param options
     */
    retrieveDetails(
        options: RetrieveDetailsOptions,
    ): Promise<GetResponseObject<ServiceCode.RetrieveDetails>>;

    /**
     * @description
     * Vending clients can notify CIS system of the payment transaction status at their client side by this interface. After receiving the payment transaction status, CIS system will determine whether to convert the pending payment record into real one or not according to the transaction status at client side.
     * If transaction is also successfully at client side, CIS system will convert the pending payment record and execute deduction of the frozen amount from the wallet of the vending client, otherwise, CIS system will not convert the pending payment record, but defreeze the frozen amount for the vending client.
     * @param options
     */
    acknowledge(
        options: AcknowledgementOptions,
    ): Promise<GetResponseObject<ServiceCode.Acknowledge>>;
}