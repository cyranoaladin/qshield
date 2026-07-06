# QES / QCI Changelog

## 1.1.0 / 1.0.1 — QCI Missing-Factor Cap

- Kept QES weights unchanged at version `1.1.0`.
- Bumped QCI behavior version to `1.0.1`.
- Added deterministic QCI caps when QES factors are unavailable:
  - one missing factor: QCI capped at 79;
  - two missing factors: QCI capped at 69;
  - three or more missing factors: QCI capped at 59.
- Preserved QES renormalization over observable factors.
- Preserved the rule that QCI below 40 disables grade display.

## 1.1.0 / 1.0.0 — Initial MVP Implementation

- Added QES weights from `SKILLS.md`.
- Added QCI weights and display thresholds.
- Added validation, grade mapping, factor renormalization and rounded breakdown allocation.
- Added PDA/off-curve not-applicable behavior.
- Added low-confidence behavior: no grade display when QCI is below 40.
- Added golden fixtures for empty, high-value, low-confidence and off-curve inputs.
