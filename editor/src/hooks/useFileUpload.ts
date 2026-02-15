import { useCallback } from "react";
import {
  useHashParamBase64,
  useHashParamJson,
} from "@metapages/hash-query/react-hooks";
import {
  UploadedFileInfo,
  injectUploadCommentIntoCode,
} from "/@/utils/codeComments";
import { InputsHashParam } from "/@/components/sections/settings/SectionInputs";

async function uploadFile(file: File): Promise<UploadedFileInfo> {
  // Compute SHA256 hash of file content
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const sha256 = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Get presigned URL
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
      sha256,
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes
      .json()
      .catch(() => ({ error: presignRes.statusText }));
    throw new Error(err.error || `Presign failed: ${presignRes.status}`);
  }

  const { presignedUrl, canonicalPath } = await presignRes.json();

  // Upload directly to S3 via presigned URL
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed for ${file.name}: ${uploadRes.status}`);
  }

  return {
    name: file.name,
    url: `${window.location.origin}${canonicalPath}`,
    contentType: file.type || "application/octet-stream",
  };
}

export function useHandleFilesUploaded() {
  const [code, setCode] = useHashParamBase64("js");
  const [hashInputs, setHashInputs] = useHashParamJson<
    InputsHashParam | undefined
  >("inputs");

  const handleFilesUploaded = useCallback(
    (files: UploadedFileInfo[]) => {
      const newInputs: InputsHashParam = { ...hashInputs };
      for (const file of files) {
        newInputs[file.name] = { type: "url", value: file.url };
      }
      setHashInputs(newInputs);

      const newCode = injectUploadCommentIntoCode(files, code);
      setCode(newCode);
    },
    [hashInputs, setHashInputs, code, setCode],
  );

  return handleFilesUploaded;
}

export { uploadFile };
export type { UploadedFileInfo };
