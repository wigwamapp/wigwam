export type HashRecord = Record<string, unknown>;

export type Destination = HashRecord | ((current: HashRecord) => HashRecord);
