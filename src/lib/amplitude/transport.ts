import { BaseTransport } from "@amplitude/analytics-core";
import { Payload, Response, Transport } from "@amplitude/analytics-types";

export class SendBeaconTransport extends BaseTransport implements Transport {
  async send(serverUrl: string, payload: Payload): Promise<Response | null> {
    return new Promise((resolve, reject) => {
      if (
        typeof window === "undefined" ||
        typeof window.navigator === "undefined" ||
        typeof window.navigator.sendBeacon === "undefined"
      ) {
        throw new Error("SendBeaconTransport is not supported");
      }

      try {
        const data = JSON.stringify(payload);
        const success = window.navigator.sendBeacon(
          serverUrl,
          JSON.stringify(payload),
        );

        return resolve(
          this.buildResponse(
            success
              ? {
                  code: 200,
                  events_ingested: payload.events.length,
                  payload_size_bytes: data.length,
                  server_upload_time: Date.now(),
                }
              : { code: 500 },
          ),
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}
