import type { Network } from "./types.ts";
type MerchantConfig = {
    id: string;
    identifierRegex: RegExp;
    defaultDomain: string;
    domains: {
        [K in Network]: string;
    };
};
export declare const merchants: MerchantConfig[];
export declare const convertMerchantQRToLightningAddress: ({ qrContent, network, }: {
    qrContent: string;
    network: Network;
}) => string | null;
export {};
