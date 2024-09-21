import { ethers } from "ethers";

import { ERC721__factory } from "abi-types";

import {
  IPFS_CLOUDFLARE_GATEWAY,
  IPFS_IO_GATEWAY,
  SVG_IMAGE_MIME_TYPE,
} from "./defaults";
import { sanitizeUrl, serealizeTokenId1155 } from "./utils";
import {
  fetchMimeType,
  fetchURI,
  getAlternateContractCall,
  getPrivateGateway,
  getStaticURI,
  getURIData,
  createDataURI,
} from "./uri";
import { fetchOnChainData, normaliseURIData } from "./metadata";

type AgentOptions = {
  ipfsGatewayUrl?: string;
  ipfsFallbackGatewayUrl?: string;
  timeout?: number;
};

export interface NftMetadata {
  tokenId: string;
  tokenAddress: string;
  metadata: any;
  tokenURI: string;
  tokenURL: string;
  tokenURLMimeType: string;
  name?: string;
  description?: string;
  contentURL?: string;
  contentURLMimeType?: string;
  imageURL?: string;
  imageURLMimeType?: string;
  externalURL?: string;
  attributes?: Record<string, any>[];
}

export class ChainFetchError extends Error {}

export class NFTMetadataAgent {
  timeout: number;
  ipfsGatewayUrl: string;
  ipfsFallbackGatewayUrl: string;

  constructor(
    private chainId: number,
    private provider: ethers.JsonRpcApiProvider,
    opts: AgentOptions = {},
  ) {
    this.ipfsGatewayUrl = opts.ipfsGatewayUrl || IPFS_IO_GATEWAY;
    this.ipfsFallbackGatewayUrl =
      opts.ipfsFallbackGatewayUrl || IPFS_CLOUDFLARE_GATEWAY;
    this.timeout = opts.timeout || 40_000;
  }

  public async fetchTokenURI(tokenAddress: string, tokenId: string) {
    const staticURI = getStaticURI(this.chainId, tokenAddress, tokenId);

    if (staticURI) {
      return staticURI;
    }

    const alternateMethod = await getAlternateContractCall(
      this.chainId,
      tokenAddress,
      tokenId,
      this.provider,
    );

    if (alternateMethod) {
      return alternateMethod;
    }

    try {
      const erc721Contract = ERC721__factory.connect(
        tokenAddress,
        this.provider,
      );
      const uri = await erc721Contract.tokenURI(tokenId);

      return {
        uri,
        type: "ERC721",
      };
    } catch {
      // if this fails, attempt 1155 fetch
    }

    try {
      const erc1155Contract = new ethers.Contract(
        tokenAddress,
        ["function uri(uint256 index) public view returns (string memory)"],
        this.provider,
      );

      let uri = await erc1155Contract.uri(tokenId);

      if (uri.includes("{id}")) {
        uri = uri.replace("{id}", serealizeTokenId1155(tokenId));
      }

      return { uri, type: "ERC1155" };
    } catch {
      // if this fails, fail function
    }

    throw new ChainFetchError("Cannot fetch uri from contract");
  }

  public async fetchURIData(
    tokenAddress: string,
    tokenId: string,
    tokenURI: string,
    ipfsGateway: string,
  ) {
    const alternateMethod = getURIData(this.chainId, tokenAddress, tokenId);

    if (alternateMethod) {
      return alternateMethod;
    }

    const resp = await fetchURI(
      tokenURI,
      { timeout: this.timeout },
      ipfsGateway,
      this.ipfsFallbackGatewayUrl,
    );

    if (!resp) {
      throw new Error(`Failed to fetch uri data for token from: ${tokenURI}`);
    }

    return resp;
  }

  private async parseURIData(
    tokenAddress: string,
    tokenId: string,
    tokenURI: string,
    uriData: any = {},
    ipfsGateway: string,
  ) {
    const onChainData = await fetchOnChainData(
      this.chainId,
      tokenAddress,
      tokenId,
      this.provider,
    );

    const meta = normaliseURIData(this.chainId, tokenAddress, {
      ...uriData,
      ...onChainData,
      ...(uriData?.mimeType && {
        contentURLMimeType: uriData.mimeType,
      }),
    });

    if (meta.image) {
      meta.imageURL = sanitizeUrl(meta.image, ipfsGateway);
    }

    if (meta.image_data) {
      meta.imageURL = createDataURI(SVG_IMAGE_MIME_TYPE, meta.image_data);
      meta.imageURLMimeType = SVG_IMAGE_MIME_TYPE;
    }

    if (meta.animation_url) {
      meta.contentURL = sanitizeUrl(meta.animation_url, ipfsGateway);
    }

    if (!meta.contentURL && meta.imageURL) {
      meta.contentURL = meta.imageURL;
    }

    if (meta.contentURL && !meta.contentURLMimeType) {
      meta.contentURLMimeType = await fetchMimeType(meta.contentURL, {
        timeout: this.timeout,
      });
    }

    if (meta.imageURL && !meta.imageURLMimeType) {
      meta.imageURLMimeType = await fetchMimeType(meta.imageURL, {
        timeout: this.timeout,
      });
    }

    const {
      name,
      description,
      attributes,
      external_url: externalURL,
      imageURL,
      imageURLMimeType,
      contentURL,
      contentURLMimeType,
    } = meta;

    return {
      tokenURL: sanitizeUrl(tokenURI),
      tokenURLMimeType: "application/json",
      ...(name && { name }),
      ...(description && { description }),
      ...(imageURL && { imageURL }),
      ...(imageURLMimeType && { imageURLMimeType }),
      ...(contentURL && { contentURL }),
      ...(contentURLMimeType && { contentURLMimeType }),
      ...(attributes && { attributes }),
      ...(externalURL && { externalURL }),
    };
  }

  public async fetchMetadata(
    rawAddress: string,
    tokenId: string,
  ): Promise<NftMetadata> {
    const tokenAddress = ethers.getAddress(rawAddress);
    try {
      const uriFetchResult = await this.fetchTokenURI(tokenAddress, tokenId);

      const { uri: tokenURI, type: tokenType } = uriFetchResult;

      const ipfsGateway =
        getPrivateGateway(this.chainId, tokenAddress) || this.ipfsGatewayUrl;

      const URIData = await this.fetchURIData(
        tokenAddress,
        tokenId,
        tokenURI,
        ipfsGateway,
      );

      const metadata = await this.parseURIData(
        tokenAddress,
        tokenId,
        tokenURI,
        URIData,
        ipfsGateway,
      );

      return {
        tokenId,
        tokenAddress,
        metadata: URIData,
        tokenURI,
        tokenType,
        ...metadata,
      };
    } catch (err) {
      if (err instanceof ChainFetchError) {
        console.error(err);
        throw new Error(
          `Failed to get tokenURI token: ${tokenAddress} is unsupported`,
        );
      }

      throw err;
    }
  }
}
