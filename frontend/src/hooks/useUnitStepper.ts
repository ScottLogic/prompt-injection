import { useState } from "react";

function useUnitStepper(initialValue = 0) {
  const [value, setValue] = useState(initialValue);

  function increment(maxCap?: number) {
    setValue(Math.min(value + 1, maxCap ?? Infinity));
  }

  function decrement(minCap = 0) {
    setValue(Math.max(value - 1, minCap));
  }

  function reset() {
    setValue(initialValue);
  }

  return {
    value: value,
    increment: increment,
    decrement: decrement,
    reset: reset,
  };
}

export default useUnitStepper;
