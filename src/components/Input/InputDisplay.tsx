import { useState } from "react";
import { useScopedKvState } from "../../hooks/useKvState";

export function InputDisplay() {
  const [show, setShow] = useState(true);
  const [inpValue, setInpValue] = useScopedKvState<string, string>(
    "inputValue"
  );

  return (
    <div>
      <button onClick={() => setShow(!show)}>show/hide</button>
      {show && (
        <input value={inpValue} onChange={(e) => setInpValue(e.target.value)} />
      )}
    </div>
  );
}
