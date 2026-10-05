type Environment = {
  port: number;
};

function getPort(): number {
  const value = process.env.API_PORT;

  if (value === undefined) {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid API_PORT: ${value}`);
  }

  return port;
}

export const env: Environment = {
  port: getPort(),
};
