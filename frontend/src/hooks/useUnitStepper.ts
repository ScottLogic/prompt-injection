import { useState } from "react";

function useUnitStepper(initialValue = 0) {
  const [value, setValue] = useState(initialValue);

  function increase(maxCap?: number) {
    setValue(Math.min(value + 1, maxCap ?? Infinity));
  }

  function decrease(minCap = 0) {
    setValue(Math.max(value - 1, minCap));
  }

  function reset() {
    setValue(initialValue);
  }

  return [value, increase, decrease, reset] as const;
}

export default useUnitStepper;
