export type ProductBoot = {
  apiBase: (origin: string) => string;
  writeSession: (write: (key: string, value: string) => void) => void;
  shellFixtures: Record<string, unknown>;
  patchWeb?: () => void;
};

const SESSION_COOKIES = ["accessToken", "refreshToken"];

const SIGNED_IN = {
  id: "user-prototype",
  email: "jordan.reyes@example.com",
  firstName: "Jordan",
  lastName: "Reyes",
  fullName: "Jordan Reyes",
  emailVerified: true,
  hasPassword: true,
  preferred_language: "en",
};

export const product: ProductBoot = {
  apiBase: () => (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "") || "https://api.versemate.org",
  patchWeb: () => {
    for (const name of SESSION_COOKIES) document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
  writeSession: () => {
    document.cookie = "accessToken=prototype-session; path=/; SameSite=Lax";
  },
  shellFixtures: {
    "GET /user/me": SIGNED_IN,
    "GET /bible/books": { books: [] },
    "GET /bible/book/bookmarks/:userId": { favorites: [] },
    "GET /bible/book/notes/:userId": { notes: [] },
    "GET /bible/highlights/:userId": { highlights: [] },
  },
};
