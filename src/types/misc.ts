export type IMisc = {
    /** generates the orderNO in the format:  yyyyMMddHHmmssSSS+appID(last 3 digits)+serial number (6 digits) for example: 20210910093045123001000001 */
    generateOrderNo(date?: Date): string;
};
