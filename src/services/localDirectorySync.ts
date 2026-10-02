import { QuestionMistake } from "../types/vault";

let mountedDirHandle: any = null;

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function getMountedDirectoryName(): string | null {
  return mountedDirHandle ? mountedDirHandle.name : null;
}

export async function mountLocalDirectory(): Promise<string> {
  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API is not supported in this browser. Please use Chrome/Edge or use ZIP Backup / Google Drive sync.");
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      id: "apexvault_local_sync",
      mode: "readwrite",
      startIn: "documents",
    });

    mountedDirHandle = handle;
    return handle.name;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Directory selection was cancelled");
    }
    throw err;
  }
}

export function unmountLocalDirectory(): void {
  mountedDirHandle = null;
}

// Helper to convert data URL to Blob
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(";base64,");
  const contentType = parts[0].replace("data:", "");
  const raw = window.atob(parts[1] || "");
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

// Clean folder names for OS filesystem compatibility
function sanitizeFolderName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim();
}

/**
 * Mirror questions & WebP images to mounted local directory:
 * /vault_index.json
 * /images/{Subject}/{Chapter}/{id}_q.webp
 * /images/{Subject}/{Chapter}/{id}_sol.webp
 */
export async function syncToMountedDirectory(questions: QuestionMistake[]): Promise<{ writtenCount: number; dirName: string }> {
  if (!mountedDirHandle) {
    throw new Error("No local directory mounted. Click 'Mount Local Folder' first.");
  }

  // Verify permission
  const permission = await mountedDirHandle.queryPermission({ mode: "readwrite" });
  if (permission !== "granted") {
    const req = await mountedDirHandle.requestPermission({ mode: "readwrite" });
    if (req !== "granted") {
      throw new Error("Permission denied to write to mounted folder.");
    }
  }

  // 1. Write vault_index.json
  const indexFileHandle = await mountedDirHandle.getFileHandle("vault_index.json", { create: true });
  const indexWritable = await indexFileHandle.createWritable();
  
  // Create index without bulky inline base64 for fastest filesystem loading, but store relative image paths
  const cleanIndex = questions.map((q) => {
    const subFolder = `images/${sanitizeFolderName(q.subject)}/${sanitizeFolderName(q.chapter)}`;
    return {
      ...q,
      questionImagePath: `${subFolder}/${q.id}_question.webp`,
      solutionImagePath: q.solutionImage ? `${subFolder}/${q.id}_solution.webp` : undefined,
    };
  });

  await indexWritable.write(JSON.stringify(cleanIndex, null, 2));
  await indexWritable.close();

  // 2. Write /images/{Subject}/{Chapter}/*
  const imagesDir = await mountedDirHandle.getDirectoryHandle("images", { create: true });

  let writtenCount = 0;
  for (const q of questions) {
    try {
      const subjectDir = await imagesDir.getDirectoryHandle(sanitizeFolderName(q.subject), { create: true });
      const chapterDir = await subjectDir.getDirectoryHandle(sanitizeFolderName(q.chapter), { create: true });

      // Write question image if data URL
      if (q.questionImage && q.questionImage.startsWith("data:")) {
        const qBlob = dataUrlToBlob(q.questionImage);
        const qFileHandle = await chapterDir.getFileHandle(`${q.id}_question.webp`, { create: true });
        const qWritable = await qFileHandle.createWritable();
        await qWritable.write(qBlob);
        await qWritable.close();
      }

      // Write solution image if present
      if (q.solutionImage && q.solutionImage.startsWith("data:")) {
        const solBlob = dataUrlToBlob(q.solutionImage);
        const solFileHandle = await chapterDir.getFileHandle(`${q.id}_solution.webp`, { create: true });
        const solWritable = await solFileHandle.createWritable();
        await solWritable.write(solBlob);
        await solWritable.close();
      }

      writtenCount++;
    } catch (e) {
      console.warn(`Could not write images for ${q.id} to local disk:`, e);
    }
  }

  return { writtenCount, dirName: mountedDirHandle.name };
}
