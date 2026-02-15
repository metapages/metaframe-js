export interface UploadedFileInfo {
  name: string;
  url: string;
  contentType: string;
}

export function buildUploadComment(files: UploadedFileInfo[]): string {
  const lines: string[] = [
    "// Uploaded file(s) (expire in 7 days): accessed directly via URLs or via onInputs:",
  ];

  for (const file of files) {
    lines.push(`//   ${file.name}: ${file.url}`);
    if (file.contentType.startsWith("image/")) {
      lines.push(
        `//   As image: 
// const img = new Image(); img.src = "${file.url}"; document.getElementById("root").appendChild(img);
// root.appendChild(img);
// `,
      );
    }
    lines.push(`// Fetch it: 
//   const response = await fetch("${file.url}");`);
    lines.push(`// If an image, show it: 
//   const image = document.createElement("img");
//   image.src = "${file.url}";
//   document.getElementById("root").appendChild(image);`);
  }

  return lines.join("\n");
}

export function injectUploadCommentIntoCode(
  files: UploadedFileInfo[],
  currentCode: string,
): string {
  if (files.length === 0) return currentCode;
  const comment = buildUploadComment(files);
  return comment + "\n" + (currentCode || "");
}
