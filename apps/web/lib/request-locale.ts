import { cookies } from "next/headers";
import { defaultLocale, localeCookieName, resolveLocale } from "./i18n";

export async function getRequestLocale() {
  const store = await cookies();
  return resolveLocale(store.get(localeCookieName)?.value || defaultLocale);
}