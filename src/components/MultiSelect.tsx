import { useScopedKvState } from "../hooks/useKvStateClient";

const options = [
  { id: 1, label: "Option 1", selected: false },
  { id: 2, label: "Option 2", selected: false },
  { id: 3, label: "Option 3", selected: false },
  { id: 4, label: "Option 4", selected: false },
];

export function MultiSelectionGroup() {
  const [optsState] = useScopedKvState(`selectedOptions`, options);

  return (
    <div>
      {optsState.map((option) => (
        <CheckItem key={option.id} option={option} />
      ))}
      <DisplaySelected />
    </div>
  );
}

export function CheckItem({ option }: any) {
  const [optsState, setOpts] = useScopedKvState<string, typeof options>(
    `selectedOptions`
  );

  const setSelected = (option: { id: number }) => {
    const newOptions = optsState.map((opt) => {
      if (opt.id === option.id) {
        return { ...opt, selected: !opt.selected };
      }
      return opt;
    });
    setOpts(newOptions);
  };

  return (
    <label key={option.id}>
      <input
        type="checkbox"
        checked={option.selected}
        onChange={() => setSelected(option)}
      />
      {option.label}
    </label>
  );
}

export function DisplaySelected() {
  const [optsState] = useScopedKvState<string, typeof options>(
    `selectedOptions`
  );

  if (!optsState) {
    return null;
  }

  return (
    <div>
      <h3>Selected Options</h3>
      {optsState
        .filter((opt) => opt.selected)
        .map((opt) => (
          <div key={opt.id}>{opt.label}</div>
        ))}
    </div>
  );
}
