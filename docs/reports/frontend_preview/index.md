# QuantaLayer Scan Frontend Preview

Date: 2026-07-06

Branch: `review/frontend-visual-preview`

## Local Launch

The frontend was launched through the existing Playwright web server configuration in
`apps/web/playwright.config.ts`.

Command used for capture:

```bash
FRONTEND_PREVIEW=1 NEXT_PUBLIC_API_URL=http://127.0.0.1:3001 \
  pnpm --filter @quantalayer/web exec playwright test e2e/frontend-preview.spec.ts --project=chromium
```

The Playwright web server runs:

```bash
pnpm dev
```

The app was served at `http://localhost:3000`, equivalent for local review to
`http://127.0.0.1:3000`.

## API Mocking

No live provider smoke was run. No Helius or Jupiter request was triggered.

The preview test uses Playwright `context.addInitScript()` to patch `window.fetch` only for:

- `POST /api/v1/scan`
- `GET /api/v1/stats`
- `POST /api/v1/waitlist`

All responses are synthetic and local to the browser session. The scan address used for preview is:

```text
11111111111111111111111111111111
```

The OG card is generated from the local Next route `/api/og/score` and does not call the backend.

## Captured Pages

| File                             | Page / state                | Dimensions |
| -------------------------------- | --------------------------- | ---------: |
| `01-landing-desktop.png`         | Landing, desktop            |  1440x1000 |
| `02-landing-mobile.png`          | Landing, mobile             |    390x930 |
| `03-scan-result-desktop.png`     | Scan success, desktop       |  1440x1668 |
| `04-scan-result-mobile.png`      | Scan success, mobile        |   390x2070 |
| `05-scan-low-confidence.png`     | Scan with QCI below 40      |  1440x1372 |
| `06-scan-pda-not-applicable.png` | PDA / not applicable state  |  1440x1316 |
| `07-scan-error.png`              | API error state             |   1440x900 |
| `08-waitlist.png`                | Waitlist with mocked submit |  1440x1000 |
| `09-learn-why-solana.png`        | Learn page                  |  1440x1200 |
| `10-stats-dashboard.png`         | Aggregate dashboard         |  1440x1222 |
| `11-og-score-card.png`           | OG score image              |   1200x630 |

## UI/UX Observations

### Landing

- Logo is visible and not pixelated at the captured sizes.
- Core message is clear and restrained.
- Scan field is visible without scroll on desktop and mobile.
- Read-only disclaimer is visible before secondary links.
- Research Note, Learn, Waitlist and Stats CTAs are visible.
- Mobile layout stacks cleanly without horizontal overflow.

### Scan Result

- QES, QCI and grade are legible.
- Estimated migration exposure value is prominent and readable.
- Address wraps without breaking the card layout.
- Breakdown, limitations and recommendations are understandable.
- Loading state was not captured separately; existing loading copy is concise and uses the same
  bordered panel style as other transient states.
- Error state is sober and does not expose provider details.

### Low Confidence

- No grade is displayed.
- QCI is visually downgraded through the secondary color.
- The UI now states that the grade is hidden because data is insufficient.
- Empty breakdown state now shows explanatory text instead of an empty card.

### PDA / Not Applicable

- Grade displays as `N/A`.
- The UI now states that the grade is not applicable for this address.
- Recommendation points the user toward the owning program and authorities.
- Empty breakdown state now shows explanatory text.

### Waitlist

- Consent checkbox is visible and explicit.
- Wallet field is optional and labelled as a public Solana address.
- Submit button is readable.
- Mocked success state is visible.

### Learn

- Content is concise and not FUD-oriented.
- Sources are visible.
- Page density is acceptable on desktop; mobile should be checked again before public beta if the
  copy expands.

### Stats

- Dashboard contains aggregate metrics only.
- No raw wallet address, leaderboard or per-wallet ranking is displayed.
- Grade distribution is readable, although a compact bar treatment could improve scanability later.

### OG Card

- Address is truncated.
- QES, QCI and grade are readable.
- Caption is factual: `Migration Readiness Score`.
- No protection or quantum-safe claim is present.

## Visual Issues Found

- Next.js dev tools badge appeared in screenshots and overlapped the mobile QES card.
- PDA state reused the generic insufficient-QCI hidden-grade message.
- Low-confidence and PDA states displayed an empty score-breakdown card.

## Corrections Made

- Preview capture now hides the Next.js dev tools portal before screenshots.
- PDA state displays `N/A` and a dedicated non-applicability message.
- Low-confidence state displays a dedicated insufficient-data message.
- Empty score-breakdown state displays explanatory text.

## Corrections Not Made

- No backend/API/scoring behavior was changed.
- No global visual redesign was attempted.
- Stats grade distribution remains textual for staging; a bar visualization is optional for a later
  UI polish pass.
- The warning/recommendation mock strings intentionally remain mixed with ecosystem English terms
  where supplied by the synthetic API payload.
