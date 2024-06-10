import { DarkModeButton2 } from "./components/DarkModeButton2";
import { DarkModeDisplay2 } from "./components/DarkModeDisplay2";
import { InputTest } from "./components/Input";
import { InputTest2 } from "./components/Input2";
import { useKvState, usePersistentKvState } from "./hooks/useKvState";

function App() {
  const [show, setShow] = usePersistentKvState("show", false);
  const [show2, setShow2] = usePersistentKvState("show2", false);
  const [show3, setShow3] = usePersistentKvState("show3", false);
  const [show4, setShow4] = useKvState("show4", false);
  const [show5, setShow5] = useKvState("show5", false);

  return (
    <>
      <h1>Redux Test</h1>
      <button onClick={() => setShow(!show)}>show/hide 1</button>
      {show && (
        <div>
          <button onClick={() => setShow2(!show2)}>show/hide 2</button>
          {show2 && <DarkModeButton2 />}
          <button onClick={() => setShow3(!show3)}>show/hide 3</button>
          {show3 && <DarkModeDisplay2 />}
        </div>
      )}

      <hr />
      <div>
        <div>
          <button onClick={() => setShow4(!show4)}>show/hide 4</button>
        </div>
        <hr />
        {show4 && (
          <div style={{ paddingLeft: 25 }}>
            <InputTest />
            <InputTest />
            <InputTest />
          </div>
        )}
      </div>
      <hr />
      <div>
        <div>
          <button onClick={() => setShow5(!show5)}>show/hide 5</button>
        </div>
        <hr />
        {show5 && (
          <div style={{ paddingLeft: 25 }}>
            <InputTest2 />
            <InputTest2 />
            <InputTest2 />
          </div>
        )}
      </div>
    </>
  );
}

export default App;
