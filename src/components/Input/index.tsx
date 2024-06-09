import { useState } from "react";
import { useScopedKvState } from "../../hooks/useKvState";
import { InputDisplay } from "./InputDisplay";

export function InputTest() {
  const [show, setShow] = useState(true);
  const [inpValue, setInpValue] = useScopedKvState("inputValue", "test");

  return (
    <div>
      <button onClick={() => setShow(!show)}>show/hide</button>
      {show && (
        <>
          <input
            value={inpValue}
            onChange={(e) => setInpValue(e.target.value)}
          />
          <InputDisplay />
        </>
      )}
    </div>
  );
}
