import { usePersistentKvState } from "../hooks/useKvState";

export function DarkModeButton2() {
  const [darkMode, setDarkMode] = usePersistentKvState("darkMode", false);
  return (
    <button onClick={() => setDarkMode(!darkMode)}>
      Toggle Dark Mode {darkMode ? "Off" : "On"}
    </button>
  );
}
