type ConnectionInfoObject = {
  protocol: string;
  username: string | null;
  password: string | null;
  hosts: { host: string; port: number | null }[] | null;
  options: Record<any, any>;
  database: string;
};

// Utilize the ConnectionInfoObject and declaration merging to DRY up ConnectionString
export interface ConnectionString extends ConnectionInfoObject {}

export class ConnectionString {
  constructor(params: string | ConnectionInfoObject);
  toURI(): string;
  toString(): string;
}

export function parse(connectionString: string): ConnectionInfoObject;
