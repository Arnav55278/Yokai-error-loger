import { QuestionMistake } from "../types/vault";

let gDriveAccessToken: string | null = null;
let gDriveFolderId: string | null = null;
let connectedUserEmail: string | null = null;

// Dynamically load Google Identity Services client
export function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services library"));
    document.head.appendChild(script);
  });
}

export async function initiateDriveAuth(clientId: string): Promise<{ accessToken: string; email: string }> {
  if (!clientId || clientId.trim().length === 0) {
    throw new Error("Please enter a valid Google Cloud OAuth Client ID in Settings.");
  }

  await loadGisScript();

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error("Google OAuth error: " + tokenResponse.error));
            return;
          }
          gDriveAccessToken = tokenResponse.access_token;

          // Fetch user info for confirmation
          let email = "Google User";
          try {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${gDriveAccessToken}` },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              email = userData.email || email;
            }
          } catch {
            // Non-fatal
          }

          connectedUserEmail = email;
          resolve({ accessToken: tokenResponse.access_token, email });
        },
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      reject(err);
    }
  });
}

export function isDriveConnected(): boolean {
  return !!gDriveAccessToken;
}

export function getDriveUserEmail(): string | null {
  return connectedUserEmail;
}

export function disconnectDrive(): void {
  gDriveAccessToken = null;
  gDriveFolderId = null;
  connectedUserEmail = null;
}

// Locate or create the ApexVault_JEE_DB folder in Drive
async function getOrCreateVaultFolder(token: string): Promise<string> {
  if (gDriveFolderId) return gDriveFolderId;

  // Search for folder
  const query = encodeURIComponent("name = 'ApexVault_JEE_DB' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    throw new Error(`Drive folder search failed (${searchRes.status}): ${await searchRes.text()}`);
  }

  const data = await searchRes.json();
  if (data.files && data.files.length > 0) {
    gDriveFolderId = data.files[0].id;
    return gDriveFolderId!;
  }

  // Create folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "ApexVault_JEE_DB",
      mimeType: "application/vnd.google-apps.folder",
      description: "ApexVault JEE Error & Revision System Cloud Sync Database",
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create Drive folder (${createRes.status}): ${await createRes.text()}`);
  }

  const newFolder = await createRes.json();
  gDriveFolderId = newFolder.id;
  return gDriveFolderId!;
}

/**
 * Uploads or updates master vault_index.json to the ApexVault_JEE_DB folder
 */
export async function syncVaultToGoogleDrive(
  tokenOverride?: string,
  questions: QuestionMistake[] = []
): Promise<{ syncedCount: number; folderId: string }> {
  const token = tokenOverride || gDriveAccessToken;
  if (!token) {
    throw new Error("Google Drive is not connected. Authenticate first.");
  }

  const folderId = await getOrCreateVaultFolder(token);

  // Check if vault_index.json already exists in folder
  const query = encodeURIComponent(`name = 'vault_index.json' and '${folderId}' in parents and trashed = false`);
  const findRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const findData = await findRes.json();
  const existingFileId = findData.files && findData.files.length > 0 ? findData.files[0].id : null;

  const metadata = {
    name: "vault_index.json",
    mimeType: "application/json",
    description: `ApexVault Master Index - ${questions.length} questions`,
    parents: existingFileId ? undefined : [folderId],
  };

  const payload = JSON.stringify({
    version: "1.0",
    syncedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    questions,
  }, null, 2);

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    payload +
    closeDelim;

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const method = existingFileId ? "PATCH" : "POST";

  const uploadRes = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to sync vault_index.json to Google Drive: ${await uploadRes.text()}`);
  }

  return { syncedCount: questions.length, folderId };
}
