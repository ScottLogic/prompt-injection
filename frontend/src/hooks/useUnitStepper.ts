import { useState } from "react";

function useUnitStepper(initialValue = 0) {
  const [value, setValue] = useState(initialValue);

  function increment(maxCap?: number) {
    setValue((oldValue) => Math.min(oldValue + 1, maxCap ?? Infinity));
  }

  function decrement(minCap = 0) {
    setValue((oldValue) => Math.max(oldValue - 1, minCap));
  }

  function reset() {
    setValue(initialValue);
  }

  return {
    value,
    increment,
    decrement,
    reset,
  };
}

export default useUnitStepper;
