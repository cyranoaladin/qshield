# QuantaLayer LaTeX Compile Report

Date: 2026-07-05

## Build Phase

The PDF release artifacts were previously generated with:

```bash
scripts/build_research_note.sh
```

## Final Non-Destructive Integrity Pass

No rebuild was run after the final public checksum had been written. The final integrity pass only used non-destructive verification commands:

```bash
sha256sum docs/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf
sha256sum public/articles/research-note-1.pdf
sha256sum public/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf
cd public/articles && sha256sum -c research-note-1.pdf.sha256
cd public/articles && sha256sum -c article_quantalayer_post_quantum_solana_research_note_1.pdf.sha256
cmp -s public/articles/research-note-1.pdf public/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf
pdfinfo public/articles/research-note-1.pdf
pdffonts public/articles/research-note-1.pdf
qpdf --check public/articles/research-note-1.pdf || true
pdftoppm -png -r 180 -f 1 -l 1 -singlefile public/articles/research-note-1.pdf build/rendered/page-01
pdftoppm -png -r 180 -f 2 -l 2 -singlefile public/articles/research-note-1.pdf build/rendered/page-02-toc
pdftoppm -png -r 180 -f 10 -l 10 -singlefile public/articles/research-note-1.pdf build/rendered/page-10-notary
pdftoppm -png -r 180 -f 11 -l 11 -singlefile public/articles/research-note-1.pdf build/rendered/page-11-signature-message
pdftoppm -png -r 180 -f 17 -l 17 -singlefile public/articles/research-note-1.pdf build/rendered/page-17-notary-json
pdftoppm -png -r 180 -f 18 -l 18 -singlefile public/articles/research-note-1.pdf build/rendered/page-18-scan-json
pdftoppm -png -r 180 -f 19 -l 19 -singlefile public/articles/research-note-1.pdf build/rendered/page-19-release
strings public/articles/research-note-1.pdf
pdftotext public/articles/research-note-1.pdf -
```

## Compilation Result

Compilation succeeded from a clean auxiliary state with XeLaTeX, latexmk and biber.

The public PDF is the linearized artifact served as `public/articles/research-note-1.pdf`. The long public copy is byte-for-byte identical to that public alias.

Output files:

- `docs/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf`
- `docs/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf.sha256`
- `build/article_quantalayer_post_quantum_solana_research_note_1_linearized.pdf`
- `public/articles/research-note-1.pdf`
- `public/articles/research-note-1.pdf.sha256`
- `public/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf`
- `public/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf.sha256`

Bibliography:

- `docs/articles/article_quantalayer_references.bib`
- 49 entries.

## Page Count

```text
Pages:           19
```

## Remaining LaTeX Warnings

Final warning scan:

```bash
grep -E "Overfull|Underfull|Warning|Undefined|Rerun|Missing|Error" build/article_quantalayer_final.log | grep -v "Package: rerunfilecheck" || true
```

Result:

```text
No remaining important LaTeX warnings.
```

No undefined references, no undefined citations and no significant overfull boxes remain in the final log.

## Public Release Checksum

```text
8f35fea672aea7c0211c5daca8590cca78ffcecbb04514376ce9e90c91b33e85  research-note-1.pdf
```

Checksum verification:

```text
research-note-1.pdf: OK
article_quantalayer_post_quantum_solana_research_note_1.pdf: OK
```

## Artifact Hash Clarification

The build artifact and the public alias can have different hashes because the public alias is generated from the linearized PDF. The official public checksum is always `public/articles/research-note-1.pdf.sha256`.

| Artifact                                                                      | Role                  | Linearized? |            Size | SHA-256                                                            |
| ----------------------------------------------------------------------------- | --------------------- | ----------: | --------------: | ------------------------------------------------------------------ |
| `docs/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf`   | build artifact        |          no | 1,698,511 bytes | `f30a2e0b321122bcfa1f408cbefef83dc29e56829e5c41fcd80f9541d7bbd9f8` |
| `public/articles/research-note-1.pdf`                                         | official public alias |         yes | 1,699,544 bytes | `8f35fea672aea7c0211c5daca8590cca78ffcecbb04514376ce9e90c91b33e85` |
| `public/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf` | long public copy      |         yes | 1,699,544 bytes | `8f35fea672aea7c0211c5daca8590cca78ffcecbb04514376ce9e90c91b33e85` |

The two public copies are byte-for-byte identical.

## Public pdffonts Result

```text
name                                 type              encoding         emb sub uni object ID
------------------------------------ ----------------- ---------------- --- --- --- ---------
AZKWHC+Inter-ExtraBold-Identity-H    CID Type 0C       Identity-H       yes yes yes    449  0
FJOJQX+Inter-Regular-Identity-H      CID Type 0C       Identity-H       yes yes yes    451  0
ZMPAWV+TeXGyreTermes-Regular-Identity-H CID Type 0C       Identity-H       yes yes yes    453  0
CYNORZ+TeXGyreTermes-Bold-Identity-H CID Type 0C       Identity-H       yes yes yes    455  0
EZWALD+TeXGyreTermesMath-Regular-Identity-H CID Type 0C       Identity-H       yes yes yes    457  0
VCQFBZ+DejaVuSansMono                CID TrueType      Identity-H       yes yes yes    459  0
UMPKCJ+TeXGyreTermes-Italic-Identity-H CID Type 0C       Identity-H       yes yes yes    461  0
```

All listed fonts are embedded.

## Public pdfinfo Result

```text
Title:           QuantaLayer Research Note #1: Preparing Solana for the Post-Quantum Era
Subject:         Post-Quantum Readiness for Solana
Keywords:        post-quantum cryptography, Solana, Ed25519, Falcon, QuantaLayer, QES, QCI
Author:          Alaeddine Ben Rhouma, Money Factory AI Lab
Creator:         LaTeX with hyperref
Producer:        XeTeX version 0.999995
CreationDate:    Sun Jul  5 19:27:48 2026 CET
Custom Metadata: no
Metadata Stream: yes
Tagged:          no
UserProperties:  no
Suspects:        no
Form:            none
JavaScript:      no
Pages:           19
Encrypted:       no
Page size:       595.28 x 841.89 pts (A4)
Page rot:        0
File size:       1699544 bytes
Optimized:       yes
PDF version:     1.5
```

## qpdf Result

Build PDF:

```text
checking docs/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf
PDF Version: 1.5
File is not encrypted
File is not linearized
No syntax or stream encoding errors found; the file may still contain
errors that qpdf cannot detect
```

Public PDF:

```text
checking public/articles/research-note-1.pdf
PDF Version: 1.5
File is not encrypted
File is linearized
No syntax or stream encoding errors found; the file may still contain
errors that qpdf cannot detect
```

## Residual Name and Claim Checks

Repository text scan: no public article or release artifact contains legacy product names outside intentionally non-public audit context.

Public PDF string scan: no legacy product names found.

## Rendered Pages Inspected

Rendered at 180 DPI:

- `build/rendered/page-01.png` — title page, canonical URL, checksum link and contact.
- `build/rendered/page-02-toc.png` — explicit abstract heading and one-page contents.
- `build/rendered/page-10-notary.png` — Notary flow table.
- `build/rendered/page-11-signature-message.png` — complete `signature_message` block on one page.
- `build/rendered/page-17-notary-json.png` — Notary certificate JSON and schema note.
- `build/rendered/page-18-scan-json.png` — scan examples and display-behavior note.
- `build/rendered/page-19-release.png` — release integrity protocol.

Manual inspection found no table outside margins, no visibly clipped text, no blank page, no unreadable JSON block and no residual public placeholder on the inspected pages.

## Main Modifications in Final Release Pass

- Kept the canonical URL on `https://quantalayer.app/articles/research-note-1.pdf`.
- Added the public short alias and companion checksum.
- Changed the build script so the public PDFs are linearized and byte-for-byte identical.
- Added release manifest and publication checklist.
- Updated article README with build artifact, public alias and checksum verification rules.
- Replaced the Notary vertical flow diagram with a table.
- Added `needspace` guarding for the `signature_message` block.
- Added explanatory notes before Notary and Scan JSON examples.

## Points Requiring Human Validation

- Confirm that `https://quantalayer.app/articles/research-note-1.pdf` and the matching `.sha256` URL are deployed exactly as linked.
- Confirm that `research@quantalayer.app` is an active monitored mailbox before publication.
- Trademark clearance for the QuantaLayer name remains a legal/administrative step.
- Legal review remains required for Notary/eIDAS/RGPD language before commercial deployment.
- QuantaLayer Vault must remain non-mainnet until public devnet testing, independent audits, caps, recovery documentation and incident monitoring are completed.
