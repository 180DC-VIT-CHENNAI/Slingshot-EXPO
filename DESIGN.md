# Slingshot Expo Design Contract

## 1. Product and mood

An energetic 180 Degrees Consulting carnival game presented as a small cinematic stage. The reveal should feel tactile and celebratory, while the logo remains pristine and ceremonial rather than becoming a target.

## 2. Color tokens

- `stage.navy`: `#0A1628`
- `brand.green`: `#2E7D32`
- `brand.greenDark`: `#1B5E20`
- `brand.greenLight`: `#4CAF50`
- `brand.neon`: `#7CFC00`
- `accent.gold`: `#FFD166`
- `cloth.midnight`: `#172337`
- `cloth.shadow`: `#080D16`
- `rope.base`: `#8A623D`
- `rope.highlight`: `#D4A76A`
- `wood.base`: `#70472A`
- `text.primary`: `#FFFFFF`
- `text.muted`: `rgba(255,255,255,.65)`

## 3. Typography

Poppins is the display face; Inter is body copy. Game-state labels are uppercase, compact, and heavily weighted. Supporting copy is sentence case and never competes with the logo.

## 4. Spacing and shape

The global spacing unit is 4px. Cards use 16-24px radii. In-canvas props use restrained rounding so wood, metal, rope, and cloth remain materially distinct.

## 5. Components and primitives

- `StageBackdrop`: the existing full-bleed illustrated play background.
- `ProtectedMark`: a complete 180DC mark on a light plaque, always behind the cloth and never used for collision.
- `SuspendedCover`: deep navy fabric made from shaded panels, folds, hem, grommets, and two visibly connected ropes.
- `ReleaseBoard`: small wooden tag on the right support line with gold/neon target rings and `RELEASE` copy.
- `Arrow`: wooden shaft, metal head, and green fletching; it visibly remains embedded in the board after a hit.
- `GameStateCallout`: centered uppercase status plus optional supporting copy.

## 6. Motion

- Idle cloth and board move by 2-4px/deg on slow sine easing to communicate suspension.
- A hit follows this sequence: arrow embeds, board jolts/splinters, release line snaps, cover tilts then accelerates downward, camera eases to a maximum 1.035 zoom, particles bloom, reveal copy settles.
- A miss leaves the cover untouched, shows `STILL COVERED`, and resets the arrow in place for an immediate retry.
- Motion uses transform/opacity properties and respects reduced-motion in the DOM overlays.

## 7. Responsive behavior

The logo/cover group scales down on narrow screens while retaining a readable target. The target stays away from the logo and above the trajectory midpoint. Reveal copy uses a smaller mobile scale and wraps the subtitle within the viewport.

## 8. Accessibility and accepted debt

Canvas interaction retains a large pointer hit area and high-contrast trajectory/target cues. DOM modals keep semantic inputs and buttons. The Phaser canvas does not currently expose a keyboard-equivalent aiming model; that is accepted existing debt outside this visual interaction update.
