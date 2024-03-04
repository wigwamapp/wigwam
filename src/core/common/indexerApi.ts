import axios from "axios";

export const indexerApi = axios.create({
  baseURL: process.env.WIGWAM_INDEXER_API!,
  timeout: 120_000,
  headers: {
    "X-API-KEY": process.env.WIGWAM_INDEXER_API_KEY,
  },
});

indexerApi.interceptors.request.use(async (config) => {
  if (config.params?._authAddress) {
    // const authSig = await storage.fetchForce<string>(
    //   `authsig_${config.params._authAddress}`,
    // );

    // (config as any)._authAddress = config.params._authAddress;
    delete config.params._authAddress;

    // if (authSig) config.headers["Auth-Signature"] = authSig;
  }

  return config;
});

// indexerApi.interceptors.response.use(
//   (res) => res,
//   async (err: AxiosError) => {
//     console.warn(err);

//     const res = err.response;

//     if (res?.status === 401 && (res.config as any)._authAddress) {
//       // TODO: enqueue
//       const existing = await storage.fetchForce(Setting.RequiredAuthSig);
//       const next = Array.from(
//         new Set([...(existing ?? []), (res.config as any)._authAddress]),
//       );
//       await storage.put(Setting.RequiredAuthSig, next);
//     }

//     throw err;
//   },
// );
