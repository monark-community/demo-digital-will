import administrator from "../../public/images/administrator.jpg"
import guardians from "../../public/images/guardians.jpg"
import owner from "../../public/images/owner.jpg"

/** Unsplash photos (free licence), credited on /credits and listed in docs/assets.md. */
export const PHOTOS = [
  {
    key: "owner",
    src: owner,
    photographer: "Vitaly Gariev",
    profile: "https://unsplash.com/@silverkblack",
    page: "https://unsplash.com/photos/znxxhOIQtIE",
  },
  {
    key: "guardians",
    src: guardians,
    photographer: "Priscilla Du Preez",
    profile: "https://unsplash.com/@priscilladupreez",
    page: "https://unsplash.com/photos/K8XYGbw4Ahg",
  },
  {
    key: "administrator",
    src: administrator,
    photographer: "Andres Vera",
    profile: "https://unsplash.com/@canonvera",
    page: "https://unsplash.com/photos/d8-78LclvmQ",
  },
] as const
