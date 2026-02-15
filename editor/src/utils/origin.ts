// This is not much use for a single static site, but becomes more relevant
// when part of a server

let origin = window.location.origin;
if (import.meta.env.DEV) {
  origin = `https://${import.meta.env.VITE_APP_FQDN || "metaframe1.dev"}${
    import.meta.env.VITE_APP_PORT ? ":" + import.meta.env.VITE_APP_PORT : ""
  }`;
}

export const APP_ORIGIN = origin;
