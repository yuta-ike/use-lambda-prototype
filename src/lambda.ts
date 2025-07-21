"use lambda";

type Input = {
  name: string;
};

export const lambdaAction = async (input: Input) => {
  const message = `Hello, ${input.name}!`;

  return {
    name: input.name,
    message,
  };
};
