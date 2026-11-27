type Environment = {
  port: number;
  databaseUrl: string;
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

function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;

  // No silent default here: connecting to the wrong database is worse than
  // refusing to start.
  if (value === undefined || value.trim() === "") {
    throw new Error("DATABASE_URL is not set (copy .env.example to .env)");
  }

  return value;
}

export const env: Environment = {
  port: getPort(),
  databaseUrl: getDatabaseUrl(),
};
