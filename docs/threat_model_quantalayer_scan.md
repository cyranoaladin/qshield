# Threat Model — QuantaLayer Scan

Status: MVP security and abuse reference.

## Scope

QuantaLayer Scan is a read-only application that receives a public Solana address, retrieves public
on-chain and pricing data, computes QES/QCI, stores aggregate scan metadata and displays migration
readiness guidance. It must not request custody, private keys, seed phrases or transaction
signatures.

## Protected Assets

- User trust in the read-only scanner.
- Availability and integrity of scan responses.
- API keys for Helius, price providers and infrastructure.
- Redis/cache state and rate-limit counters.
- Database rows containing address hashes and aggregate scan metadata.
- Waitlist emails and consent records.
- Public claims, warnings and generated share images.

## Non-Threats

- Recovering or protecting private keys.
- Signing transactions.
- Moving funds.
- Replacing Solana protocol migration.
- Auditing wallets, custody workflows or protocol authorities.
- Predicting Q-Day or individual compromise probability.

## Assumptions

- Scanned addresses are public Solana data, but raw addresses still should not be persisted in MVP
  aggregate storage.
- External providers can fail, rate limit, return partial data or return malformed data.
- Users may scan addresses they do not control.
- Attackers may use public scores as targeting or phishing context.
- A missing Helius key must fail before network access.

## Abuse Cases And Mitigations

| Abuse case                                        | Risk                                                   | Mitigation                                                                |
| ------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| API scraping to build high-exposure address lists | Targeting and privacy harm                             | Per-IP rate limit, cache, no public leaderboard, no raw address stats     |
| Whale targeting through shared scores             | Harassment or phishing                                 | No nominative ranking, conservative display, no urgency language          |
| Fake reports or phishing prompts                  | Users may be tricked into signing or revealing secrets | Read-only warnings, official domain links, never request secrets          |
| False precision from incomplete data              | Users may over-trust QES                               | QCI controls grade display; low QCI hides grade                           |
| Dusting / spam token manipulation                 | Token count inflation                                  | Minimum value threshold, spam down-weighting, QCI reduction when polluted |
| RPC/DAS compromise or malformed data              | Incorrect score or unsafe UI                           | Zod validation, fail-closed errors, no partial score                      |
| Price provider outage                             | Misvaluation                                           | Batch requests, mark unresolved prices, lower QCI                         |
| Cache poisoning                                   | Stale or wrong results                                 | Typed cache values, TTL, address-hash keys                                |
| Log leakage                                       | Addresses or emails exposed in logs                    | Hash/truncate addresses; never log request bodies or emails               |

## QuantaLayer Scan Specific Risks

- A high score can be interpreted as a panic signal. UI copy must describe prioritization, not
  imminent compromise.
- A low score can be interpreted as a guarantee. UI copy must explain that the score is bounded by
  observable data.
- PDA/off-curve addresses should not be graded like key-controlled accounts. The output should
  explain that the relevant exposure often sits in program or authority control.

## Provider Failure Policy

The API must fail closed when required provider data is malformed or incomplete. It should return a
problem JSON response rather than a guessed partial score.

## Privacy Policy For MVP Data

- Persist `addressHash = SHA-256(rawAddress)` for scan aggregates.
- Do not store raw scanned addresses in `Scan` rows.
- Waitlist emails require explicit consent.
- Duplicate waitlist submissions are idempotent.
- Public stats are aggregate only.
