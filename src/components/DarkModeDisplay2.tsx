import { usePersistentKvState } from "../hooks/useKvState";

export function DarkModeDisplay2() {
  const [darkMode] = usePersistentKvState("darkMode", true);
  return <p>{darkMode ? "Dark Mode" : "Light Mode"}</p>;
}
