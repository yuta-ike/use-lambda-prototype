"use lambda";

export const calcAddition = async (a: number, b: number): Promise<number> => {
  return a + b;
};

export const calcSubtraction = async (
  a: number,
  b: number
): Promise<number> => {
  return a - b;
};
