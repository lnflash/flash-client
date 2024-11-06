"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMerchantQRToLightningAddress = exports.merchants = void 0;
exports.merchants = [
    {
        id: "picknpay",
        identifierRegex: /(?<identifier>.*za\.co\.electrum\.picknpay.*)/iu,
        defaultDomain: "cryptoqr.net",
        domains: {
            mainnet: "cryptoqr.net",
            signet: "staging.cryptoqr.net",
            regtest: "staging.cryptoqr.net",
        },
    },
    {
        id: "ecentric",
        identifierRegex: /(?<identifier>.*za\.co\.ecentric.*)/iu,
        defaultDomain: "cryptoqr.net",
        domains: {
            mainnet: "cryptoqr.net",
            signet: "staging.cryptoqr.net",
            regtest: "staging.cryptoqr.net",
        },
    },
];
const convertMerchantQRToLightningAddress = ({ qrContent, network, }) => {
    var _a;
    if (!qrContent) {
        return null;
    }
    for (const merchant of exports.merchants) {
        const match = qrContent.match(merchant.identifierRegex);
        if ((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.identifier) {
            const domain = merchant.domains[network] || merchant.defaultDomain;
            return `${encodeURIComponent(match.groups.identifier)}@${domain}`;
        }
    }
    return null;
};
exports.convertMerchantQRToLightningAddress = convertMerchantQRToLightningAddress;
