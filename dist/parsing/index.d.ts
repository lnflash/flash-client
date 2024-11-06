import bolt11 from "bolt11";
import type { Network } from "./types";
export declare const parseBolt11Network: (network: string) => bolt11.Network;
export declare const getDescription: (decoded: bolt11.PaymentRequestObject) => string | undefined;
export declare const getDestination: (decoded: bolt11.PaymentRequestObject) => string | undefined;
export declare const getHashFromInvoice: (invoice: string, network: Network) => string | undefined;
export declare const PaymentType: {
    readonly Lightning: "lightning";
    readonly Intraledger: "intraledger";
    readonly IntraledgerWithFlag: "intraledgerWithFlag";
    readonly Onchain: "onchain";
    readonly Lnurl: "lnurl";
    readonly NullInput: "nullInput";
    readonly Unified: "unified";
    readonly Unknown: "unknown";
};
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];
export type UnknownPaymentDestination = {
    valid: false;
    paymentType: typeof PaymentType.Unknown;
};
export type NullInputPaymentDestination = {
    paymentType: typeof PaymentType.NullInput;
};
export declare const InvalidLnurlPaymentDestinationReason: {
    Unknown: string;
};
export type InvalidLnurlPaymentDestinationReason = (typeof InvalidLnurlPaymentDestinationReason)[keyof typeof InvalidLnurlPaymentDestinationReason];
export type LnurlPaymentDestination = {
    paymentType: typeof PaymentType.Lnurl;
    valid: true;
    lnurl: string;
} | {
    paymentType: typeof PaymentType.Lnurl;
    valid: false;
    invalidReason: InvalidLnurlPaymentDestinationReason;
};
export declare const InvalidLightningDestinationReason: {
    readonly InvoiceExpired: "InvoiceExpired";
    readonly WrongNetwork: "WrongNetwork";
    readonly Unknown: "Unknown";
};
export type InvalidLightningDestinationReason = (typeof InvalidLightningDestinationReason)[keyof typeof InvalidLightningDestinationReason];
export type LightningPaymentDestination = {
    paymentType: typeof PaymentType.Lightning;
    valid: true;
    paymentRequest: string;
    amount?: number | undefined;
    memo?: string | undefined;
} | {
    paymentType: typeof PaymentType.Lightning;
    valid: false;
    invalidReason: InvalidLightningDestinationReason;
};
export declare const InvalidOnchainDestinationReason: {
    readonly WrongNetwork: "WrongNetwork";
    readonly Unknown: "Unknown";
    readonly InvalidAmount: "InvalidAmount";
};
export type InvalidOnchainDestinationReason = (typeof InvalidOnchainDestinationReason)[keyof typeof InvalidOnchainDestinationReason];
export type OnchainPaymentDestination = {
    paymentType: typeof PaymentType.Onchain;
    valid: true;
    address: string;
    amount?: number | undefined;
    memo?: string | undefined;
} | {
    paymentType: typeof PaymentType.Onchain;
    valid: false;
    invalidReason: InvalidOnchainDestinationReason;
};
export declare const IntraledgerFlag: {
    readonly Usd: "usd";
};
export declare const InvalidIntraledgerReason: {
    readonly WrongDomain: "WrongDomain";
};
export type IntraledgerFlag = (typeof IntraledgerFlag)[keyof typeof IntraledgerFlag];
export type InvalidIntraledgerReason = (typeof InvalidIntraledgerReason)[keyof typeof InvalidIntraledgerReason];
export type IntraledgerPaymentDestination = {
    valid: true;
    paymentType: typeof PaymentType.Intraledger;
    handle: string;
} | {
    valid: true;
    paymentType: typeof PaymentType.IntraledgerWithFlag;
    handle: string;
    flag: IntraledgerFlag;
} | {
    valid: false;
    paymentType: typeof PaymentType.Intraledger;
    invalidReason: InvalidIntraledgerReason;
    handle: string;
};
export type ParsedPaymentDestination = UnknownPaymentDestination | NullInputPaymentDestination | LnurlPaymentDestination | LightningPaymentDestination | OnchainPaymentDestination | IntraledgerPaymentDestination;
export declare const lightningInvoiceHasExpired: (payReq: bolt11.PaymentRequestObject) => boolean;
export declare const getLightningInvoiceExpiryTime: (payReq: bolt11.PaymentRequestObject) => number;
export declare const decodeInvoiceString: (invoice: string, network: Network) => bolt11.PaymentRequestObject;
type ParsePaymentDestinationArgs = {
    destination: string;
    network: Network;
    lnAddressDomains: string[];
};
export declare const parsePaymentDestination: ({ destination, network, lnAddressDomains, }: ParsePaymentDestinationArgs) => ParsedPaymentDestination;
export {};
