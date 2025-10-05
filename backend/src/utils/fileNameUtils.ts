import path from "path";

export function sanitizeFileName(originalName: string): string {
  const name = path.basename(originalName, path.extname(originalName));
  const ext = path.extname(originalName);

  // Replace spaces & special chars with dashes, keep alphanumerics + dash/underscore
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, "-");

  return safeName + ext.toLowerCase();
}
