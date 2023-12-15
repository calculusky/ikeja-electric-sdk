import BaseAPI from "./base";
import * as dayjs from "dayjs";
import * as Util from "../utils";
import * as ms from "../types/misc";

export default class MiscAPI extends BaseAPI implements ms.IMisc {
    generateOrderNo(date: Date = new Date()): string {
        const datePart = dayjs(date).format("YYYYMMDDHHmmssSSS");
        const serialNo = Util.generateRandomNumber(6);
        const appIdLast3Digits = this.getConfig().appId.slice(-3);
        return `${datePart}${appIdLast3Digits}${serialNo}`;
    }
}
