import { useState } from "react";
import { useScopedKvState } from "../../hooks/useKvState";
import { InputDisplay } from "./InputDisplay";

export function InputTest2() {
  const [show, setShow] = useState(false);
  const [inpValue, setInpValue] = useScopedKvState("inputValue", "test2");

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
          <InputDisplay />
        </>
      )}
    </div>
  );
}
