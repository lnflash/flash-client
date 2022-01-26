export const VERSION = "0.0.11"

import * as lightningPayReq from "bolt11"

export * from "./parse-payment-destination"
export * from "./graphql/index"
export * from "./translate/index"

export const getDescription = (decoded: lightningPayReq.PaymentRequestObject) => {
  const data = decoded.tags.find((value) => value.tagName === "description")?.data
  if (data) {
    return data as string
  }
}

export const getDestination = (
  decoded: lightningPayReq.PaymentRequestObject,
): string | undefined => decoded.payeeNodeKey

export const getHashFromInvoice = (invoice: string): string | undefined => {
  const decoded = lightningPayReq.decode(invoice)
  const data = decoded.tags.find((value) => value.tagName === "payment_hash")?.data
  if (data) {
    return data as string
  }
}