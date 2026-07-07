# Post-Quantum Glossary For QuantaLayer

Status: reusable public education reference.

## Shor

Quantum algorithm that can solve integer factoring and discrete logarithm problems efficiently on a
large, fault-tolerant quantum computer. For Solana, the relevant point is Ed25519: if a
cryptographically relevant quantum computer existed, Ed25519 assumptions would no longer hold.

## Grover

Quantum search algorithm that gives a quadratic speedup for brute-force search. It weakens generic
hash security margins but does not turn SHA-256 or Keccak into the same type of problem as Ed25519.

## Ed25519

The EdDSA signature scheme used widely in Solana accounts and transactions. Key-controlled Solana
addresses are Ed25519 public keys encoded as addresses.

## ML-KEM

NIST FIPS 203 key-encapsulation mechanism, formerly associated with Kyber. It is for key exchange,
not wallet signatures.

## ML-DSA

NIST FIPS 204 digital signature standard, formerly associated with Dilithium. QuantaLayer Notary
research uses ML-DSA as an off-chain certificate signature candidate, not as a Solana runtime
replacement in the Scan MVP.

## SLH-DSA

NIST FIPS 205 stateless hash-based signature standard, formerly associated with SPHINCS+. It is
conservative but has large signatures compared with Ed25519.

## WOTS+

Winternitz One-Time Signature scheme. It is hash-based and must be used only once per signing key.
It is relevant to experimental vault research, not to the Scan MVP.

## PDA

Program Derived Address. A Solana address derived off-curve without a private key. For Scan, a PDA
should be treated differently from a user-controlled Ed25519 keypair.

## Crypto-Agility

The ability to inventory, prioritize, swap and migrate cryptographic mechanisms without emergency
rewrites. QuantaLayer Scan supports this by measuring migration criticality and data confidence.

## Q-Day

Informal term for the arrival of a cryptographically relevant quantum computer. QuantaLayer does not
predict this date.

## Harvest-Now-Decrypt-Later

Attack model where encrypted data is stored today and decrypted later when better cryptanalytic
capability exists. It is more directly relevant to encryption confidentiality than to public Solana
signature keys, but it is part of the broader post-quantum migration context.

## On-Spend Vs At-Rest

"On-spend" refers to attacks during a transaction signing or spend window. "At-rest" refers to
public keys or account states already exposed while funds or authorities remain controlled by those
keys. Solana's address-as-public-key model makes at-rest inventory important.
