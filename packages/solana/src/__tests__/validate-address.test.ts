import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";

import { validateSolanaAddress } from "../validate-address.js";

describe("validateSolanaAddress", () => {
  it.each([
    ["11111111111111111111111111111111", true, true, "system"],
    ["not-base58-0000", false, false, "unknown"],
  ] as const)("validates %s", (address, isValid, isOnCurve, accountClassHint) => {
    expect(validateSolanaAddress(address)).toMatchObject({
      accountClassHint,
      address,
      isOnCurve,
      isValid,
    });
  });

  it("detects off-curve PDA addresses", () => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("quantalayer-test")],
      new PublicKey("11111111111111111111111111111111"),
    );

    expect(validateSolanaAddress(pda.toBase58())).toMatchObject({
      accountClassHint: "pda",
      isOnCurve: false,
      isValid: true,
    });
  });
});
