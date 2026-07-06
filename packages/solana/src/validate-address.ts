import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

import type { AddressValidationResult } from "./types.js";

export function validateSolanaAddress(address: string): AddressValidationResult {
  try {
    const decoded = bs58.decode(address);

    if (decoded.length !== 32) {
      return invalid(address);
    }

    const isOnCurve = PublicKey.isOnCurve(decoded);

    return {
      accountClassHint: isOnCurve ? "system" : "pda",
      address,
      isOnCurve,
      isValid: true,
    };
  } catch {
    return invalid(address);
  }
}

function invalid(address: string): AddressValidationResult {
  return {
    accountClassHint: "unknown",
    address,
    isOnCurve: false,
    isValid: false,
  };
}
