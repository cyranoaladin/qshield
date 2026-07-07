#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTICLE_DIR="${ROOT_DIR}/docs/articles"
BUILD_DIR="${ROOT_DIR}/build"
PUBLIC_ARTICLE_DIR="${ROOT_DIR}/public/articles"
WEB_PUBLIC_ARTICLE_DIR="${ROOT_DIR}/apps/web/public/articles"
TEX_FILE="article_quantalayer_post_quantum_solana_research_note_1.tex"
PDF_FILE="article_quantalayer_post_quantum_solana_research_note_1.pdf"
CHECKSUM_FILE="${PDF_FILE}.sha256"
LINEARIZED_FILE="${BUILD_DIR}/article_quantalayer_post_quantum_solana_research_note_1_linearized.pdf"
PUBLIC_SHORT_PDF="research-note-1.pdf"
PUBLIC_SHORT_CHECKSUM="${PUBLIC_SHORT_PDF}.sha256"
LOG_FILE="${BUILD_DIR}/article_quantalayer_build.log"
FINAL_LOG_FILE="${BUILD_DIR}/article_quantalayer_final.log"

mkdir -p "${BUILD_DIR}"
mkdir -p "${PUBLIC_ARTICLE_DIR}"
mkdir -p "${WEB_PUBLIC_ARTICLE_DIR}"

cd "${ARTICLE_DIR}"

rm -f \
  article_quantalayer_post_quantum_solana_research_note_1.aux \
  article_quantalayer_post_quantum_solana_research_note_1.bbl \
  article_quantalayer_post_quantum_solana_research_note_1.bcf \
  article_quantalayer_post_quantum_solana_research_note_1.blg \
  article_quantalayer_post_quantum_solana_research_note_1.fdb_latexmk \
  article_quantalayer_post_quantum_solana_research_note_1.fls \
  article_quantalayer_post_quantum_solana_research_note_1.log \
  article_quantalayer_post_quantum_solana_research_note_1.out \
  article_quantalayer_post_quantum_solana_research_note_1.run.xml \
  article_quantalayer_post_quantum_solana_research_note_1.toc \
  article_quantalayer_post_quantum_solana_research_note_1.xdv \
  "${CHECKSUM_FILE}"

rm -f \
  "${PUBLIC_ARTICLE_DIR}/${PDF_FILE}" \
  "${PUBLIC_ARTICLE_DIR}/${CHECKSUM_FILE}" \
  "${PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_PDF}" \
  "${PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_CHECKSUM}" \
  "${WEB_PUBLIC_ARTICLE_DIR}/${PDF_FILE}" \
  "${WEB_PUBLIC_ARTICLE_DIR}/${CHECKSUM_FILE}" \
  "${WEB_PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_PDF}" \
  "${WEB_PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_CHECKSUM}" \
  "${LINEARIZED_FILE}"

latexmk -C "${TEX_FILE}" >/dev/null 2>&1 || true

latexmk \
  -xelatex \
  -interaction=nonstopmode \
  -halt-on-error \
  -file-line-error \
  "${TEX_FILE}" 2>&1 | tee "${LOG_FILE}"

test -s "${PDF_FILE}"

cp "article_quantalayer_post_quantum_solana_research_note_1.log" "${FINAL_LOG_FILE}"

latexmk -c "${TEX_FILE}" >/dev/null 2>&1 || true

rm -f \
  article_quantalayer_post_quantum_solana_research_note_1.bbl \
  article_quantalayer_post_quantum_solana_research_note_1.bcf \
  article_quantalayer_post_quantum_solana_research_note_1.blg \
  article_quantalayer_post_quantum_solana_research_note_1.run.xml \
  article_quantalayer_post_quantum_solana_research_note_1.xdv

sha256sum "${PDF_FILE}" > "${CHECKSUM_FILE}"

if ! command -v qpdf >/dev/null 2>&1; then
  echo "qpdf is required to produce the public linearized PDF" >&2
  exit 1
fi

qpdf --linearize "${PDF_FILE}" "${LINEARIZED_FILE}"
cp "${LINEARIZED_FILE}" "${PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_PDF}"
cp "${LINEARIZED_FILE}" "${PUBLIC_ARTICLE_DIR}/${PDF_FILE}"
cp "${LINEARIZED_FILE}" "${WEB_PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_PDF}"
cp "${LINEARIZED_FILE}" "${WEB_PUBLIC_ARTICLE_DIR}/${PDF_FILE}"

(
  cd "${PUBLIC_ARTICLE_DIR}"
  sha256sum "${PUBLIC_SHORT_PDF}" > "${PUBLIC_SHORT_CHECKSUM}"
  sha256sum "${PDF_FILE}" > "${CHECKSUM_FILE}"
  sha256sum -c "${PUBLIC_SHORT_CHECKSUM}"
  sha256sum -c "${CHECKSUM_FILE}"
  cmp -s "${PUBLIC_SHORT_PDF}" "${PDF_FILE}"
)

cp "${PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_CHECKSUM}" "${WEB_PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_CHECKSUM}"
cp "${PUBLIC_ARTICLE_DIR}/${CHECKSUM_FILE}" "${WEB_PUBLIC_ARTICLE_DIR}/${CHECKSUM_FILE}"

echo
echo "Important LaTeX warnings:"
grep -E "Overfull|Underfull|Warning|Undefined|Rerun|Missing|Error" "${FINAL_LOG_FILE}" \
  | grep -v "Package: rerunfilecheck" || true

echo
echo "Release checksum:"
cat "${PUBLIC_ARTICLE_DIR}/${PUBLIC_SHORT_CHECKSUM}"
