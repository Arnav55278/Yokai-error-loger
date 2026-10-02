import JSZip from "jszip";
import { QuestionMistake, AppSettings } from "../types/vault";

export async function exportVaultZip(questions: QuestionMistake[], settings: AppSettings): Promise<Blob> {
  const zip = new JSZip();

  // Create clean index
  const indexData = {
    exportedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    settings,
    questions,
  };

  zip.file("vault_index.json", JSON.stringify(indexData, null, 2));

  // Add images to zip folder
  const imagesFolder = zip.folder("images");
  if (imagesFolder) {
    for (const q of questions) {
      if (q.questionImage && q.questionImage.includes(";base64,")) {
        const base64 = q.questionImage.split(";base64,")[1];
        imagesFolder.file(`${q.id}_question.webp`, base64, { base64: true });
      }
      if (q.solutionImage && q.solutionImage.includes(";base64,")) {
        const solBase64 = q.solutionImage.split(";base64,")[1];
        imagesFolder.file(`${q.id}_solution.webp`, solBase64, { base64: true });
      }
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importVaultZip(
  file: File
): Promise<{ questions: QuestionMistake[]; settings?: AppSettings }> {
  const zip = await JSZip.loadAsync(file);

  const indexFile = zip.file("vault_index.json");
  if (!indexFile) {
    throw new Error("Invalid backup file: 'vault_index.json' not found inside the ZIP archive.");
  }

  const indexContent = await indexFile.async("string");
  const data = JSON.parse(indexContent);

  const importedQuestions: QuestionMistake[] = data.questions || [];

  // Check if images need to be loaded from zip files
  for (const q of importedQuestions) {
    if (!q.questionImage || !q.questionImage.startsWith("data:")) {
      const qImgFile = zip.file(`images/${q.id}_question.webp`);
      if (qImgFile) {
        const base64 = await qImgFile.async("base64");
        q.questionImage = `data:image/webp;base64,${base64}`;
      }
    }
    if (q.solutionImage && !q.solutionImage.startsWith("data:")) {
      const solImgFile = zip.file(`images/${q.id}_solution.webp`);
      if (solImgFile) {
        const base64 = await solImgFile.async("base64");
        q.solutionImage = `data:image/webp;base64,${base64}`;
      }
    }
  }

  return {
    questions: importedQuestions,
    settings: data.settings,
  };
}
