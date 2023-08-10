import {
  MAKERSPLACE_TOKEN_ADDRESS,
  SUPERRARE_TOKEN_ADDRESS,
  ZORA_TOKEN_ADDRESS,
  HEAVEN_COMPUTER_TOKEN_ADDRESS,
  POTION_ART_TOKEN_ADDRESS,
  FOUNDATION_TOKEN_ADDRESS,
} from "../defaults";
import { isAddressMatch } from "../utils";

export function translateZoraMetadataSchema(schema: any) {
  // TODO - this ia naive based on current usage
  if ("body" in schema) {
    return {
      origin: "catalog-20210202",
      version: "zora-20210604",
      name: schema.body.title,
      description: schema.body.notes || "",
      mimeType: schema.body.mimeType,
      image: !schema.body?.artwork?.isNft
        ? schema.body?.artwork?.info?.uri
        : undefined,
      external_url: "https://catalog.works",
      ...schema,
    };
  }

  return schema;
}

function normaliseAttributes(
  attributes: Record<string, any> | Record<string, any>[],
) {
  if (Array.isArray(attributes)) {
    return attributes;
  }

  if (typeof attributes === "object") {
    return Object.keys(attributes).map((trait_type: string) => ({
      value: attributes[trait_type],
      trait_type,
    }));
  }

  return attributes;
}

export function normaliseURIData(
  chainId: number,
  tokenAddress: string,
  data: Record<string, any>,
) {
  let normalisedData = data;

  if (isAddressMatch(chainId, tokenAddress, MAKERSPLACE_TOKEN_ADDRESS)) {
    const animationURI =
      normalisedData?.properties?.preview_media_file2 &&
      normalisedData?.properties?.preview_media_file2_type?.description ===
        "mp4"
        ? normalisedData?.properties?.preview_media_file2.description
        : undefined;

    if (animationURI) {
      normalisedData.animation_url = animationURI;
    }
  }

  // Fix for foundation: normalize content-type in animation for files ending in glb.
  if (isAddressMatch(chainId, tokenAddress, FOUNDATION_TOKEN_ADDRESS)) {
    normalisedData = {
      ...normalisedData,
      contentURLMimeType: normalisedData.animation_url?.endsWith("glb")
        ? "model/gltf-binary"
        : undefined,
    };
  }

  if (isAddressMatch(chainId, tokenAddress, ZORA_TOKEN_ADDRESS)) {
    normalisedData = translateZoraMetadataSchema(normalisedData);
  }

  if (isAddressMatch(chainId, tokenAddress, POTION_ART_TOKEN_ADDRESS)) {
    normalisedData = Object.entries(normalisedData.properties).reduce(
      (last: any, [key, value]: any) => {
        last[key] = value.description;
        return last;
      },
      {},
    );
  }

  if (isAddressMatch(chainId, tokenAddress, SUPERRARE_TOKEN_ADDRESS)) {
    normalisedData = {
      ...normalisedData,
      ...(normalisedData.media && {
        contentURL: normalisedData.media.uri,
        contentURLMimeType: normalisedData.media.mimeType,
      }),
    };
  }

  if (isAddressMatch(chainId, tokenAddress, HEAVEN_COMPUTER_TOKEN_ADDRESS)) {
    normalisedData = {
      ...normalisedData,
      ...(normalisedData.animation_url && {
        animation_url: normalisedData.image,
      }),
    };
  }

  // If properties exist on object, copy them over to attributes.
  // Properties match the 1155 standard for metadata properties.
  if (normalisedData.properties) {
    normalisedData = {
      ...normalisedData,
      attributes: normalisedData.properties,
    };
  }

  const attributes = normalisedData.attributes || normalisedData.traits;
  const image = normalisedData.image || normalisedData.image_url;
  return {
    ...normalisedData,
    ...(image && {
      image,
    }),
    ...(attributes && {
      attributes: normaliseAttributes(attributes),
    }),
  };
}
