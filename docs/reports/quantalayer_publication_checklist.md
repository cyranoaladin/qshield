# QuantaLayer Publication Checklist

## Document

- [x] PDF compiles from clean state
- [x] PDF is in English
- [x] No legacy suite-name residuals in public PDF
- [x] No legacy module-name residuals in public PDF
- [x] SIMD-0461 described as closed, not adopted
- [x] FIPS 206 described as not final
- [x] QES described as migration criticality, not hack probability
- [x] QCI display thresholds included
- [x] Vault described as experimental and not mainnet-ready
- [x] Notary described as non-qualified under eIDAS

## Release

- [x] Canonical URL present
- [x] Public alias `research-note-1.pdf` generated
- [x] Companion `.sha256` generated
- [x] Checksum verification passes
- [x] Public PDF is linearized
- [x] All fonts embedded
- [x] qpdf check passes
- [x] Rendered pages inspected
- [x] Final integrity pass completed without rebuilding the PDF after checksum finalization
- [x] Build artifact hash and official public artifact hash are intentionally different and documented

## Human Validation Pending

- [ ] `quantalayer.app` URL deployed
- [ ] `research@quantalayer.app` active and monitored
- [ ] Trademark clearance
- [ ] Legal review for Notary/eIDAS/RGPD
- [ ] Vault remains non-mainnet until audits and caps
