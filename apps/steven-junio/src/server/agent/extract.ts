const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function extractKnowledgeUpload(file: File) {
  if (file.size <= 0) return "";
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Knowledge uploads must be 10 MB or smaller.");
  const extension = file.name.toLowerCase().split(".").pop();

  if (extension === "txt" || extension === "md" || file.type.startsWith("text/")) {
    return (await file.text()).trim();
  }

  const arrayBuffer = await file.arrayBuffer();
  if (extension === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    return result.value.trim();
  }

  if (extension === "pdf" || file.type === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
    try {
      return (await parser.getText()).text.trim();
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Upload a Markdown, text, PDF, or DOCX file.");
}
