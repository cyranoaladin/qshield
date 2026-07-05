# QuantaLayer Artifact Integrity Audit

Date: 2026-07-05

| Artifact                                                                      | Role                   | Public? | Linearized? |            Size | SHA-256                                                            |
| ----------------------------------------------------------------------------- | ---------------------- | ------: | ----------: | --------------: | ------------------------------------------------------------------ |
| `docs/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf`   | build artifact         |      no |          no | 1,698,511 bytes | `f30a2e0b321122bcfa1f408cbefef83dc29e56829e5c41fcd80f9541d7bbd9f8` |
| `public/articles/research-note-1.pdf`                                         | canonical public alias |     yes |         yes | 1,699,544 bytes | `8f35fea672aea7c0211c5daca8590cca78ffcecbb04514376ce9e90c91b33e85` |
| `public/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf` | long public copy       |     yes |         yes | 1,699,544 bytes | `8f35fea672aea7c0211c5daca8590cca78ffcecbb04514376ce9e90c91b33e85` |

## Interpretation

- The build artifact may have a different hash from the public alias if the public alias is the linearized PDF.
- The two public copies MUST be byte-for-byte identical.
- The official public checksum is the checksum of `public/articles/research-note-1.pdf`.

## Verification

- `public/articles/research-note-1.pdf.sha256`: OK.
- `public/articles/article_quantalayer_post_quantum_solana_research_note_1.pdf.sha256`: OK.
- Public copies: byte-for-byte identical.
- Build artifact: valid PDF, not linearized.
- Public alias: valid PDF, linearized.
