# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license); none are Unsplash+ (each was downloaded through the free `/download` endpoint, which redirects to `images.unsplash.com`, never `plus.unsplash.com`). They were resized to 1,800 px on the long edge at quality 76, live in `public/images/`, and are served with `next/image` (static imports, so no remote image configuration). A light sepia and desaturation in CSS brings the three to one warm grade. Photographers are credited on `/credits`, linked from the footer.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/owner.jpg` | https://unsplash.com/photos/znxxhOIQtIE | Vitaly Gariev | https://unsplash.com/@silverkblack | Home, "Three people, one plan": the owner; `/credits` |
| `public/images/guardians.jpg` | https://unsplash.com/photos/K8XYGbw4Ahg | Priscilla Du Preez | https://unsplash.com/@priscilladupreez | Home, "Three people, one plan": the guardians; `/credits` |
| `public/images/administrator.jpg` | https://unsplash.com/photos/d8-78LclvmQ | Andres Vera | https://unsplash.com/@canonvera | Home, "Three people, one plan": the estate administrator; `/credits` |

## Built in code

- **Seal mark and wordmark** (`src/components/brand/logo.tsx`, `seal-path.ts`): a scalloped wax seal with a W; the favicon `src/app/icon.svg` and `public/brand/willchain-mark.svg` are generated from the same path.
- **Window ruler** (`src/components/will/window-ruler.tsx`): the protection-window diagram used in the hero, the calculator, the composer and every will page.
- **Stamps and wax seal** (`src/components/will/stamp.tsx`): guardian "Confirmed" stamps and the seal on the estate record.
- **Hero will document** (`src/components/home/hero-will.tsx`), **lifecycle diagram** and **execution steps** on `/how-it-works`, **estate record** (`src/components/demo/estate-record.tsx`).
- **Open Graph image**: generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Wallet avatars: jazzicons from the Monark UI registry `wallet` component.

## Type and icons

- Newsreader (Production Type) and Public Sans (USWDS), via `next/font/google`.
- Icons: [Lucide](https://lucide.dev).
