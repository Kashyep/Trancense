import { describe, expect, it } from "vitest";
import { validateEvidenceUpload } from "./upload-validation";

describe("evidence upload validation", () => {
  it("requires a permitted MIME type, matching extension, and matching magic bytes", () => {
    expect(validateEvidenceUpload({name:"bill.pdf",type:"application/pdf",size:4},new Uint8Array([0x25,0x50,0x44,0x46]))).toBe(true);
    expect(validateEvidenceUpload({name:"bill.pdf",type:"application/pdf",size:4},new Uint8Array([0x50,0x4b,0x03,0x04]))).toBe(false);
    expect(validateEvidenceUpload({name:"bill.exe",type:"application/pdf",size:4},new Uint8Array([0x25,0x50,0x44,0x46]))).toBe(false);
  });
  it("rejects path-like names, binary CSV, and oversize files", () => {
    expect(validateEvidenceUpload({name:"../bill.pdf",type:"application/pdf",size:4},new Uint8Array([0x25,0x50,0x44,0x46]))).toBe(false);
    expect(validateEvidenceUpload({name:"data.csv",type:"text/csv",size:2},new Uint8Array([0,1]))).toBe(false);
    expect(validateEvidenceUpload({name:"bill.pdf",type:"application/pdf",size:10*1024*1024+1},new Uint8Array([0x25,0x50,0x44,0x46]))).toBe(false);
  });
});
