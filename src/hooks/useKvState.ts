function importNextCookies() {
  if (typeof window !== "undefined") return null;

  try {
    return require("next/headers").cookies;
  } catch (error) {
    return null;
  }
}

const nextCookies = importNextCookies();

export function getPersistentKvCookies(
  key: string,
  defaultValue: any,
  localStorageKey: string = "usePersistentKvCookiesDefaultLocalStorageKey"
) {
  const lsKey = `${localStorageKey}-${key.toString()}`;
  const cookieValue = nextCookies().get(lsKey)?.value;
  const parsedValue = cookieValue ? JSON.parse(cookieValue) : defaultValue;
  return parsedValue;
}

export {
  useKvState,
  usePersistentKvState,
  usePersistentKvCookies,
  useScopedKvState,
  createKvStore,
} from "./useKvStateClient";
