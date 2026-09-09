export type Hertz = Unit<"Hertz">;
export type Seconds = Unit<"Seconds">;
export type Volume = Unit<"Volume">;

export const hertz = buildNumericUnit("Hertz", { min: 0 });
export const seconds = buildNumericUnit("Seconds", { min: 0 });
export const volume = buildNumericUnit("Volume", { min: 0, max: 1 });

interface Unit<T extends string> {
  add(n: Unit<T>): Unit<T>;
  subtract(n: Unit<T>): Unit<T>;
  multiply(n: number): Unit<T>;
  divide(n: Unit<T>): number;
  divide(n: number): Unit<T>;
  pow(n: number): Unit<T>;
  number: number;
}

type MathOperation = (a: number, b: number) => number;

function buildNumericUnit<T extends string>(
  unit: T,
  options: {
    min?: number;
    max?: number;
  } = {},
) {
  const wrap = (n: number): Unit<T> => {
    const toUnitOpPartial =
      (f: MathOperation) =>
      (m: number): Unit<T> =>
        wrap(
          verifyBounds({
            n: f(n, m),
            unit,
            ...options,
          }),
        );

    function divide(m: number): Unit<T>;
    function divide(m: Unit<T>): number;
    function divide(m: number | Unit<T>): Unit<T> | number {
      if (typeof m === "number") {
        return toUnitOpPartial((a, b) => a / b)(m);
      }
      return n / m.number; // unit cancels — no bounds check, just a ratio
    }

    const toUnitOp = (f: MathOperation) => (m: Unit<T>) =>
      toUnitOpPartial(f)(m.number);

    return {
      add: toUnitOp((a, b) => a + b),
      subtract: toUnitOp((a, b) => a - b),
      multiply: toUnitOpPartial((a, b) => a * b),
      divide,
      pow: toUnitOpPartial((a, b) => Math.pow(a, b)),
      number: n,
    };
  };
  return wrap;
}

function verifyBounds({
  n,
  min = -Infinity,
  max = Infinity,
  unit,
}: {
  n: number;
  unit: string;
  min?: number;
  max?: number;
}) {
  if (n < min || n > max) {
    throw new Error(
      `Value ${n} is outside bounds (min: ${min}, max: ${max}) for ${unit}`,
    );
  }
  return n;
}
