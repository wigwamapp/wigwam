/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly RELEASE_ENV: "true" | "false";
    readonly TARGET_BROWSER: "chrome" | "firefox" | "safari";
    readonly VERSION: string;
    readonly BUILD_ID: string;
    // Vigvam specific
    readonly VIGVAM_WEBSITE_ORIGIN: string;
    // Dev
    readonly VIGVAM_DEV_UNLOCK_PASSWORD: string;
    readonly VIGVAM_DEV_ACTIVE_TAB_RELOAD: string;
    readonly VIGVAM_DEV_ELEMENTS_SPACING: string;
    readonly VIGVAM_DEV_BLOCK_TX_SEND: string;
  }
}

declare module "*.bmp" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string } & {
      style?: React.CSSProperties & Record<string, string>;
    }
  >;

  const src: string;
  export default src;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
