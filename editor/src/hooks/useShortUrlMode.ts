import { useEffect } from "react";

declare global {
  interface Window {
    __SHORT_URL_ID?: string;
  }
}

// Check for short URL ID on this window or the parent frame (when editor is an iframe)
const getShortUrlId = (): string | undefined => {
  try {
    if (window.parent !== window && window.parent.__SHORT_URL_ID) {
      return window.parent.__SHORT_URL_ID;
    }
  } catch {
    // cross-origin parent
  }
  return window.__SHORT_URL_ID;
};

// Navigate to the full root URL using the editor's current hash state.
// This exits short URL mode using what is currently in the editor, not
// a value re-downloaded from S3 (which would override editor state).
const exitShortUrlMode = (): void => {
  const currentHash = window.location.hash;
  const target = window.parent !== window ? window.parent : window;
  target.location.href =
    target.location.origin + "/#" + currentHash.replace(/^#/, "");
};

// Strip edit=true from a hash string for content comparison.
const stripEdit = (hash: string): string =>
  hash.replace(/[?&]edit=true/g, "").replace(/#&/, "#?");

// Detects short URL mode and navigates to the full hash URL only when content
// changes while edit mode is active. Adding edit=true alone (no content change)
// does not trigger navigation, letting the editor open without leaving the short URL.
export const useShortUrlMode = (): void => {
  useEffect(() => {
    const id = getShortUrlId();
    if (!id) return;

    // If already in edit mode on page load, navigate immediately
    if (/[?&]edit=true/.test(window.location.hash)) {
      exitShortUrlMode();
      return;
    }

    const initialContent = stripEdit(window.location.hash);

    const onHashChange = () => {
      if (
        /[?&]edit=true/.test(window.location.hash) &&
        stripEdit(window.location.hash) !== initialContent
      ) {
        exitShortUrlMode();
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
};
