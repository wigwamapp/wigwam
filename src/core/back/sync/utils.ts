import { NFTContentType } from "core/types";

export function parseContentType(
  contentType?: string,
): NFTContentType | undefined {
  if (contentType?.includes("image")) return "image_url";
  if (contentType?.includes("video")) return "video_url";
  if (contentType?.includes("audio")) return "audio_url";

  return;
}
