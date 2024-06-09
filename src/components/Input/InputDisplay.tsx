import { useScopedKvState } from "../../hooks/useKvState";

export function InputDisplay() {
  const [inpValue, setInpValue] = useScopedKvState<string, string>(
    "inputValue"
  );

  return (
    <input value={inpValue} onChange={(e) => setInpValue(e.target.value)} />
  );
}
