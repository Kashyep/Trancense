const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const allowed = new Map<string, string[]>([
  ["application/pdf", ["pdf"]], ["image/png", ["png"]], ["image/jpeg", ["jpg", "jpeg"]],
  ["text/csv", ["csv"]], ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ["xlsx"]],
]);
function startsWith(bytes: Uint8Array, expected: number[]) { return expected.every((byte, index) => bytes[index] === byte); }
export function validateEvidenceUpload(file: { name: string; type: string; size: number }, bytes: Uint8Array) {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  const extensions = allowed.get(file.type);
  if (!extensions || !extensions.includes(extension) || file.size <= 0 || file.size > MAX_EVIDENCE_BYTES || /[\\/\0]/.test(file.name)) return false;
  if (file.type === "application/pdf") return startsWith(bytes, [0x25, 0x50, 0x44, 0x46]);
  if (file.type === "image/png") return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (file.type === "image/jpeg") return startsWith(bytes, [0xff, 0xd8, 0xff]);
  // XLSX is a ZIP container. We never unpack or execute it in this pilot.
  if (file.type.includes("spreadsheetml")) return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
  // CSV has no reliable magic bytes; reject binary/NUL-prefixed uploads.
  return !bytes.slice(0, 4096).includes(0);
}
