import { usePersistentKvState } from "../hooks/useKvState";

export function DarkModeDisplay2() {
  const [darkMode] = usePersistentKvState("darkMode");
  return <p>{darkMode ? "Dark Mode" : "Light Mode"}</p>;
}
