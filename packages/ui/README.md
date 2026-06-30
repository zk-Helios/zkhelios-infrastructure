# @zkhelios/ui — Design System

Shared, **chain-agnostic** React primitives for every zkHelios surface
(`apps/web`, `apps/dapp`, and `apps/docs`). The brand: **solar-amber-on-black
cypherpunk** — pure-SVG marks, glass surfaces, film-grain noise, 200–300ms
ease-out motion.

## Tokens (`@zkhelios/ui-tokens`)

Single source of truth for colors/fonts/scale/shadows/motion. Flows into Tailwind
via `@zkhelios/ui-tokens/tailwind`; importable in TS for canvas/SVG/inline styles.

- **Primary** solar amber `#F5A524` (`amber-500`)
- **Background** pure black `#000000` (`ink-900`) / charcoal `#0A0A0A` (`ink-800`)
- **Accent white** `#FAFAFA` (`paper`); muted `paper-muted`; hairlines `ink-400`
- Display **Space Grotesk** · Body **Inter** · Mono **JetBrains Mono**
- Dark mode only

## Primitives (this package)

| Export | Purpose |
| --- | --- |
| `Button` | Variants `primary` (amber glow) / `ghost` / `outline` / `link` / `danger`; sizes `sm/md/lg/icon/icon-sm` |
| `Card` + `CardTitle` + `CardDescription` | Variants `bordered` / `glass` / `glow` |
| `Section` + `SectionHeading` | Max-width (1280px) + padding wrapper; eyebrow/title/lead |
| `Logo` / `LogoMark` | SVG 8-ray sun + hex `zk` mark (`size`, `glow`, `animated`) |
| `NoiseOverlay` | Fixed SVG film grain (4–6% opacity) |
| `HexGrid` | Tiling hexagon background, configurable opacity |
| `cn` | Tailwind class merge (`@zkhelios/ui/cn`) |

Consumed by both apps; `apps/web` re-exports these from `src/components/ui/*`
shims, and `apps/dapp` imports them directly.

## App-specific (not shared)

- **Marketing** sections + interaction helpers (Lenis smooth scroll, custom cursor,
  magnetic CTA, reveal/stagger, count-up) live in `apps/web`.
- **Solana** reusable components (PublicKeyDisplay, TransactionSignatureDisplay,
  LamportsToSol, NetworkBadge, SlotProgressBar, ComputeUnitEstimate, EmptyState,
  Skeletons) live in `apps/dapp/src/components/ui`.

## Conventions

- Dark mode only (`<html class="dark">`); global amber `:focus-visible` ring.
- All motion wrapped for `prefers-reduced-motion`.
- No lorem ipsum — copy lives in each app's `lib/constants.ts`.
