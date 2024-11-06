"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaymentDestination = exports.decodeInvoiceString = exports.getLightningInvoiceExpiryTime = exports.lightningInvoiceHasExpired = exports.InvalidIntraledgerReason = exports.IntraledgerFlag = exports.InvalidOnchainDestinationReason = exports.InvalidLightningDestinationReason = exports.InvalidLnurlPaymentDestinationReason = exports.PaymentType = exports.getHashFromInvoice = exports.getDestination = exports.getDescription = exports.parseBolt11Network = void 0;
/* eslint-disable max-lines */
const bolt11_1 = __importDefault(require("bolt11"));
const lnurl_pay_1 = require("lnurl-pay");
const bitcoinjs = __importStar(require("bitcoinjs-lib"));
const ecc = __importStar(require("@bitcoinerlab/secp256k1"));
const merchants_1 = require("./merchants");
bitcoinjs.initEccLib(ecc);
const parseBitcoinJsNetwork = (network) => {
    if (network === "mainnet") {
        return bitcoinjs.networks.bitcoin;
    }
    else if (network === "signet") {
        return bitcoinjs.networks.testnet;
    }
    else if (network === "regtest") {
        return bitcoinjs.networks.regtest;
    }
    return bitcoinjs.networks.bitcoin;
};
// This is a hack to get around the fact that bolt11 doesn't support signet
const parseBolt11Network = (network) => {
    if (network === "mainnet") {
        return {
            bech32: "bc",
            pubKeyHash: 0x00,
            scriptHash: 0x05,
            validWitnessVersions: [0, 1],
        };
    }
    else if (network === "signet") {
        return {
            bech32: "tbs",
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            validWitnessVersions: [0, 1],
        };
    }
    else if (network === "regtest") {
        return {
            bech32: "bcrt",
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            validWitnessVersions: [0, 1],
        };
    }
    return {
        // default network is bitcoin
        bech32: "bc",
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        validWitnessVersions: [0, 1],
    };
};
exports.parseBolt11Network = parseBolt11Network;
const getDescription = (decoded) => {
    var _a;
    const data = (_a = decoded.tags.find((value) => value.tagName === "description")) === null || _a === void 0 ? void 0 : _a.data;
    if (data) {
        return data;
    }
};
exports.getDescription = getDescription;
const getDestination = (decoded) => decoded.payeeNodeKey;
exports.getDestination = getDestination;
const getHashFromInvoice = (invoice, network) => {
    var _a;
    const decoded = bolt11_1.default.decode(invoice, (0, exports.parseBolt11Network)(network));
    const data = (_a = decoded.tags.find((value) => value.tagName === "payment_hash")) === null || _a === void 0 ? void 0 : _a.data;
    if (data) {
        return data;
    }
};
exports.getHashFromInvoice = getHashFromInvoice;
exports.PaymentType = {
    Lightning: "lightning",
    Intraledger: "intraledger",
    IntraledgerWithFlag: "intraledgerWithFlag",
    Onchain: "onchain",
    Lnurl: "lnurl",
    NullInput: "nullInput",
    Unified: "unified",
    Unknown: "unknown",
};
exports.InvalidLnurlPaymentDestinationReason = {
    Unknown: "unknown",
};
exports.InvalidLightningDestinationReason = {
    InvoiceExpired: "InvoiceExpired",
    WrongNetwork: "WrongNetwork",
    Unknown: "Unknown",
};
exports.InvalidOnchainDestinationReason = {
    WrongNetwork: "WrongNetwork",
    Unknown: "Unknown",
    InvalidAmount: "InvalidAmount",
};
exports.IntraledgerFlag = {
    Usd: "usd",
};
exports.InvalidIntraledgerReason = {
    WrongDomain: "WrongDomain",
};
const lightningInvoiceHasExpired = (payReq) => {
    return Boolean((payReq === null || payReq === void 0 ? void 0 : payReq.timeExpireDate) && payReq.timeExpireDate < Date.now() / 1000);
};
exports.lightningInvoiceHasExpired = lightningInvoiceHasExpired;
const getLightningInvoiceExpiryTime = (payReq) => {
    return (payReq === null || payReq === void 0 ? void 0 : payReq.timeExpireDate) || NaN;
};
exports.getLightningInvoiceExpiryTime = getLightningInvoiceExpiryTime;
const decodeInvoiceString = (invoice, network) => {
    return bolt11_1.default.decode(invoice, (0, exports.parseBolt11Network)(network));
};
exports.decodeInvoiceString = decodeInvoiceString;
const reUsername = /(?!^(1|3|bc1|lnbc1))^[0-9\p{L}_]{3,50}$/u;
// from https://github.com/bitcoin/bips/blob/master/bip-0020.mediawiki#Transfer%20amount/size
const reAmount = /^(([\d.]+)(X(\d+))?|x([\da-f]*)(\.([\da-f]*))?(X([\da-f]+))?)$/iu;
const parseAmount = (txt) => {
    const match = txt.match(reAmount);
    if (!match) {
        return NaN;
    }
    return Math.round(match[5]
        ? (parseInt(match[5], 16) +
            (match[7] ? parseInt(match[7], 16) * Math.pow(16, -match[7].length) : 0)) *
            (match[9] ? Math.pow(16, parseInt(match[9], 16)) : 0x10000)
        : Number(match[2]) * (match[4] ? Math.pow(10, Number(match[4])) : 1e8));
};
const getLNParam = (data) => {
    var _a;
    try {
        return (_a = new URL(data).searchParams) === null || _a === void 0 ? void 0 : _a.get("lightning");
    }
    catch (_b) {
        return null;
    }
};
const getProtocolAndData = (destination) => {
    if (destination.toLocaleLowerCase().startsWith("lightning:")) {
        return {
            protocol: "lightning",
            destinationWithoutProtocol: destination.slice(10),
        };
    }
    if (destination.toLocaleLowerCase().startsWith("bitcoin:")) {
        return {
            protocol: "bitcoin",
            destinationWithoutProtocol: destination.slice(8),
        };
    }
    return {
        protocol: "",
        destinationWithoutProtocol: destination,
    };
};
const getPaymentType = ({ protocol, destinationWithoutProtocol, rawDestination, network, }) => {
    // As far as the client is concerned, lnurl is the same as lightning address
    if (lnurl_pay_1.utils.parseLnUrl(protocol === "lightning" ? destinationWithoutProtocol : rawDestination) ||
        lnurl_pay_1.utils.parseLightningAddress(protocol === "lightning" ? destinationWithoutProtocol : rawDestination) ||
        rawDestination.slice(0, 9) === "lnurlw://" ||
        rawDestination.slice(0, 9) === "lnurlp://" // should already be handled by parseLnUrl
    ) {
        return exports.PaymentType.Lnurl;
    }
    if (destinationWithoutProtocol.match(/^ln(bc|tb).{50,}/iu)) {
        return exports.PaymentType.Lightning;
    }
    if (destinationWithoutProtocol &&
        getLNParam(`lightning:${destinationWithoutProtocol}`)) {
        return exports.PaymentType.Unified;
    }
    if (protocol === "onchain" ||
        destinationWithoutProtocol.match(/^(1|3|bc1|tb1|bcrt1)/iu)) {
        return exports.PaymentType.Onchain;
    }
    const handle = destinationWithoutProtocol.match(/^(http|\/\/)/iu)
        ? destinationWithoutProtocol.split("/")[destinationWithoutProtocol.split("/").length - 1]
        : destinationWithoutProtocol;
    if (handle === null || handle === void 0 ? void 0 : handle.match(reUsername)) {
        return exports.PaymentType.Intraledger;
    }
    const handleAndFlag = handle === null || handle === void 0 ? void 0 : handle.split("+");
    if ((handleAndFlag === null || handleAndFlag === void 0 ? void 0 : handleAndFlag.length) === 2 &&
        handleAndFlag[0].match(reUsername) &&
        Object.values(exports.IntraledgerFlag).includes(handleAndFlag[1].toLowerCase())) {
        return exports.PaymentType.IntraledgerWithFlag;
    }
    const merchantLightningAddress = (0, merchants_1.convertMerchantQRToLightningAddress)({
        qrContent: rawDestination,
        network,
    });
    if (merchantLightningAddress) {
        return exports.PaymentType.Lnurl;
    }
    return exports.PaymentType.Unknown;
};
const getIntraLedgerPayResponse = ({ destinationWithoutProtocol, destination, lnAddressDomains, }) => {
    var _a;
    const handle = destinationWithoutProtocol.match(/^(http|\/\/)/iu)
        ? destinationWithoutProtocol.split("/")[destinationWithoutProtocol.split("/").length - 1]
        : destinationWithoutProtocol;
    if (destinationWithoutProtocol.match(/^(http|\/\/)/iu)) {
        const domain = new URL(destination).hostname;
        if (!lnAddressDomains.find((lnAddressDomain) => lnAddressDomain === domain)) {
            return {
                valid: false,
                paymentType: exports.PaymentType.Intraledger,
                handle,
                invalidReason: exports.InvalidIntraledgerReason.WrongDomain,
            };
        }
    }
    if (handle === null || handle === void 0 ? void 0 : handle.match(reUsername)) {
        return {
            valid: true,
            paymentType: exports.PaymentType.Intraledger,
            handle,
        };
    }
    const handleAndFlag = handle === null || handle === void 0 ? void 0 : handle.split("+");
    const flag = (_a = handleAndFlag[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if ((handleAndFlag === null || handleAndFlag === void 0 ? void 0 : handleAndFlag.length) === 2 &&
        handleAndFlag[0].match(reUsername) &&
        flag === exports.IntraledgerFlag.Usd) {
        return {
            valid: true,
            paymentType: exports.PaymentType.IntraledgerWithFlag,
            handle: handleAndFlag[0],
            flag,
        };
    }
    return {
        valid: false,
        paymentType: exports.PaymentType.Unknown,
    };
};
const getLNURLPayResponse = ({ lnAddressDomains, destination, network, }) => {
    // handle internal lightning addresses
    const lnAddress = lnurl_pay_1.utils.parseLightningAddress(destination);
    if (lnAddress) {
        const { username, domain } = lnAddress;
        if (lnAddressDomains.find((lnAddressDomain) => lnAddressDomain === domain)) {
            return getIntraLedgerPayResponse({
                destinationWithoutProtocol: username,
                lnAddressDomains,
                destination,
            });
        }
        return {
            valid: true,
            paymentType: exports.PaymentType.Lnurl,
            lnurl: `${username}@${domain}`,
        };
    }
    if (destination.slice(0, 9) === "lnurlw://" ||
        destination.slice(0, 9) === "lnurlp://") {
        return {
            valid: true,
            paymentType: exports.PaymentType.Lnurl,
            lnurl: destination,
        };
    }
    const lnurl = lnurl_pay_1.utils.parseLnUrl(destination);
    if (lnurl) {
        return {
            valid: true,
            paymentType: exports.PaymentType.Lnurl,
            lnurl,
        };
    }
    const merchantLightningAddress = (0, merchants_1.convertMerchantQRToLightningAddress)({
        qrContent: destination,
        network,
    });
    if (merchantLightningAddress) {
        return {
            valid: true,
            paymentType: exports.PaymentType.Lnurl,
            lnurl: merchantLightningAddress,
        };
    }
    return {
        valid: false,
        paymentType: exports.PaymentType.Unknown,
    };
};
const getLightningPayResponse = ({ destination, network, }) => {
    var _a, _b;
    const paymentType = exports.PaymentType.Lightning;
    const { destinationWithoutProtocol } = getProtocolAndData(destination);
    const lnProtocol = ((_a = getLNParam(destination)) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || destinationWithoutProtocol.toLowerCase();
    if ((network === "mainnet" &&
        !(lnProtocol.match(/^lnbc/iu) && !lnProtocol.match(/^lnbcrt/iu))) ||
        (network === "signet" && !lnProtocol.match(/^lntb/iu)) ||
        (network === "regtest" && !lnProtocol.match(/^lnbcrt/iu))) {
        return {
            valid: false,
            paymentType,
            invalidReason: exports.InvalidLightningDestinationReason.WrongNetwork,
        };
    }
    let payReq = undefined;
    try {
        payReq = bolt11_1.default.decode(lnProtocol, (0, exports.parseBolt11Network)(network));
    }
    catch (_c) {
        return {
            valid: false,
            paymentType,
            invalidReason: exports.InvalidLightningDestinationReason.Unknown,
        };
    }
    const amount = payReq.satoshis || payReq.millisatoshis
        ? ((_b = payReq.satoshis) !== null && _b !== void 0 ? _b : Number(payReq.millisatoshis) / 1000)
        : undefined;
    if ((0, exports.lightningInvoiceHasExpired)(payReq)) {
        return {
            valid: false,
            paymentType,
            invalidReason: exports.InvalidLightningDestinationReason.InvoiceExpired,
        };
    }
    const memo = (0, exports.getDescription)(payReq);
    return {
        valid: true,
        paymentRequest: lnProtocol,
        amount,
        memo,
        paymentType,
    };
};
const getOnChainPayResponse = ({ destinationWithoutProtocol, network, }) => {
    const paymentType = exports.PaymentType.Onchain;
    try {
        const decodedData = new URL(`bitcoin:${destinationWithoutProtocol}`);
        // some apps encode addresses in UPPERCASE
        const path = decodedData === null || decodedData === void 0 ? void 0 : decodedData.pathname;
        if (!path) {
            throw new Error("No address detected in decoded destination");
        }
        const label = decodedData === null || decodedData === void 0 ? void 0 : decodedData.searchParams.get("label");
        const message = decodedData === null || decodedData === void 0 ? void 0 : decodedData.searchParams.get("message");
        const memo = label || message || undefined;
        let amount = undefined;
        try {
            const parsedAmount = decodedData === null || decodedData === void 0 ? void 0 : decodedData.searchParams.get("amount");
            if (parsedAmount) {
                amount = parseAmount(parsedAmount);
            }
        }
        catch (err) {
            console.debug("[Parse error: amount]:", err);
            return {
                valid: false,
                paymentType,
                invalidReason: exports.InvalidOnchainDestinationReason.InvalidAmount,
            };
        }
        bitcoinjs.address.toOutputScript(path, parseBitcoinJsNetwork(network));
        return {
            valid: true,
            paymentType,
            address: path,
            amount,
            memo,
        };
    }
    catch (err) {
        console.debug("[Parse error: onchain]:", err);
        return {
            valid: false,
            invalidReason: exports.InvalidOnchainDestinationReason.Unknown,
            paymentType,
        };
    }
};
const getUnifiedPayResponse = ({ destination, destinationWithoutProtocol, network, }) => {
    const lightningPaymentResponse = getLightningPayResponse({
        destination,
        network,
    });
    if (lightningPaymentResponse.valid) {
        return lightningPaymentResponse;
    }
    return getOnChainPayResponse({ destinationWithoutProtocol, network });
};
const parsePaymentDestination = ({ destination, network, lnAddressDomains, }) => {
    if (!destination) {
        return { paymentType: exports.PaymentType.NullInput };
    }
    const { protocol, destinationWithoutProtocol } = getProtocolAndData(destination);
    const paymentType = getPaymentType({
        protocol,
        destinationWithoutProtocol,
        rawDestination: destination,
        network,
    });
    switch (paymentType) {
        case exports.PaymentType.Lnurl:
            return getLNURLPayResponse({
                lnAddressDomains,
                destination: protocol === "lightning" ? destinationWithoutProtocol : destination,
                network,
            });
        case exports.PaymentType.Lightning:
            return getLightningPayResponse({ destination, network });
        case exports.PaymentType.Onchain:
            return getOnChainPayResponse({ destinationWithoutProtocol, network });
        case exports.PaymentType.Intraledger:
        case exports.PaymentType.IntraledgerWithFlag:
            return getIntraLedgerPayResponse({
                destinationWithoutProtocol,
                destination,
                lnAddressDomains,
            });
        case exports.PaymentType.Unified:
            return getUnifiedPayResponse({
                destination,
                destinationWithoutProtocol,
                network,
            });
        case exports.PaymentType.Unknown:
            return { paymentType: exports.PaymentType.Unknown, valid: false };
    }
    return { paymentType: exports.PaymentType.Unknown, valid: false };
};
exports.parsePaymentDestination = parsePaymentDestination;
