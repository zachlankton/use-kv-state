# Key-Value State Hooks

1. **Simplified State Management**: This library provides a straightforward way to manage state with the `useKvState` hook, modeled after reacts own `useState` interface.  This hook makes it easier to store, retrieve, and share values across all of your components in your entire application, without the need to setup context, providers, actions, reducers, prop mapping, etc.

2. **Persistent Storage**: With the `usePersistentKvState` hook, you can easily persist key-value pairs in the browser's local storage. This allows your application to retain data across page refreshes or browser sessions, providing a seamless user experience.

3. **Scoped and Isolated Values**: The `useScopedKvState` hook enables you to create scoped and isolated key-value pairs for each component instance. This is particularly useful when you have multiple instances of the same component and want to maintain separate states for each instance, preventing unintended state sharing.

---

### Install

```bash
npm install use-kv-state
```

### Quick Examples

#### Simple KV State Shared across 2 components

```jsx
import { useKvState } from "./hooks/useKvState";

function MyFirstComponent() {
  const [count, setCount] = useKvState<string, number>("count", 0);

  return <button onClick={() => setCount(count + 1)}>Inc Count {count}</button>;
}

function MySecondComponent() {
  const [count] = useKvState<string, number>("count");

  return <p>Current count value: {count}</p>;
}
```

#### Dark mode button with persistence to localStorage
```jsx
import { usePersistentKvState } from "../hooks/useKvState";

export function DarkModeButton() {
  const [darkMode, setDarkMode] = usePersistentKvState("darkMode", false);
  return (
    <button onClick={() => setDarkMode(!darkMode)}>
      Toggle Dark Mode {darkMode ? "Off" : "On"}
    </button>
  );
}
```

---

# Docs

This library exports three custom React hooks for managing key-value stores:

1. `useKvState`
2. `usePersistentKvState`
3. `useScopedKvState`

## Usage

### `useKvState`

```jsx
const [value, setValue] = useKvState(key, initialValue);
```

- `key`: The key to identify the stored value.
- `initialValue` (optional): The initial value to be stored.

Returns a tuple containing the current value and a function to update the value.

### `usePersistentKvState`

```jsx
const [value, setValue] = usePersistentKvState(key, initialValue);
```

- `key`: The key to identify the stored value.
- `initialValue` (optional): The initial value to be stored.

Similar to `useKvState`, but the values are persisted in the browser's local storage.

### `useScopedKvState`

```jsx
const [value, setValue] = useScopedKvState(key, initialValue);
```

- `key`: The key to identify the stored value.
- `initialValue` (optional): The initial value to be stored.

This hook provides a scoped key-value store, where the values are isolated based on the component instance. It's useful when you want to have separate instances of the same key-value pair in different components.

## Example

```jsx
import { useScopedKvState } from "../hooks/useKvState";

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

```

This example demonstrates how the `useScopedKvState` hook can be used to manage scoped and isolated state across multiple components in a multi-selection group scenario. The `MultiSelectionGroup` component renders a list of `CheckItem` components and a `DisplaySelected` component, all of which share the same state key (`'selectedOptions'`) but maintain their own independent state. The `CheckItem` component updates the state when the checkbox is toggled, and the `DisplaySelected` component renders the list of selected options based on the current state. This showcases the power of the `useScopedKvState` hook in managing complex state scenarios across multiple components while ensuring proper isolation and scoping of the state.

## Configuration

The `createKvStore` function accepts an optional configuration object with the following properties:

- `persistent` (boolean, default: `false`): Determines if the values should be persisted in local storage.
- `localStorageKey` (string, default: `'usePersistentKvStateDefaultLocalStorageKey'`): The key prefix used for storing values in local storage.
- `trackAndIsolate` (boolean, default: `false`): Determines if the values should be scoped and isolated based on the component instance.

These configuration options are used internally by the exported hooks.

Here's an example of how to use the `createKvStore` function to create a custom key-value store hook with specific configurations:

```jsx
import { createKvStore } from './kvStore';

// Create a custom key-value store hook with persistent storage
const useMyPersistentKvStore = createKvStore({
  persistent: true,
  localStorageKey: 'myApp.kvStore',
});

// Create a custom key-value store hook with scoped and isolated values
const useMyIsolatedKvStore = createKvStore({
  trackAndIsolate: true,
});

function MyComponent() {
  // Use the custom persistent key-value store hook
  const [theme, setTheme] = useMyPersistentKvStore('theme', 'light');

  // Use the custom isolated key-value store hook
  const [count, setCount] = useMyIsolatedKvStore('count', 0);

  // ...
}

function AnotherComponent() {
  // Use the same custom persistent key-value store hook
  const [theme, setTheme] = useMyPersistentKvStore('theme', 'light');

  // Use the same custom isolated key-value store hook
  const [count, setCount] = useMyIsolatedKvStore('count', 0);

  // ...
}
```

In this example:

1. We create a custom key-value store hook called `useMyPersistentKvStore` using `createKvStore` with the `persistent` option set to `true` and a custom `localStorageKey` prefix of `'myApp.kvStore'`. This means that the values stored using this hook will be persisted in the browser's local storage under the key prefix `'myApp.kvStore'`.

2. We create another custom key-value store hook called `useMyIsolatedKvStore` using `createKvStore` with the `trackAndIsolate` option set to `true`. This means that the values stored using this hook will be scoped and isolated based on the component instance.

3. In `MyComponent`, we use the `useMyPersistentKvStore` hook to manage the `theme` value, which will be persisted in local storage. We also use the `useMyIsolatedKvStore` hook to manage the `count` value, which will be isolated for each instance of `MyComponent`.

4. In `AnotherComponent`, we use the same custom hooks as in `MyComponent`. The `theme` value will be shared and persisted across both components because it uses the same `useMyPersistentKvStore` hook. However, the `count` value will be isolated and separate for each component instance because it uses the `useMyIsolatedKvStore` hook.

By creating custom key-value store hooks using `createKvStore`, you can define specific configurations and reuse them across different components in your application. This allows for flexibility and consistency in managing key-value pairs with different behavior, such as persistence or isolation.