import { useState } from "react";
import { useScopedKvState } from "../../hooks/useKvStateClient";
import { InputDisplay } from "./InputDisplay";

export function InputTest() {
  const [show, setShow] = useState(true);
  const [inpValue, setInpValue] = useScopedKvState("inputValue", "test");

  return (
    <div>
      <button onClick={() => setShow(!show)}>show/hide</button>
      <hr />
      {show && (
        <div style={{ paddingLeft: 25 }}>
          <input
            value={inpValue}
            onChange={(e) => setInpValue(e.target.value)}
          />
          <InputDisplay />
          <InputDisplay />
          <InputDisplay />
          <hr />
        </div>
      )}
    </div>
  );
}
