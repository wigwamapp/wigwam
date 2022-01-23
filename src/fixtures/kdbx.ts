export type KdfParams =
  | {
      type: "Aes";
      rounds: number;
    }
  | {
      type: "Argon2d" | "Argon2id";
      memory: number;
      iterations: number;
      parallelism: number;
    };

export const KDF_PARAMS: KdfParams = {
  type: "Argon2id",
  memory: 15 * 1024 * 1024, // 15 MiB
  iterations: 2,
  parallelism: 1,
};
