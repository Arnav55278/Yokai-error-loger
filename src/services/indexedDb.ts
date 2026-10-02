import { QuestionMistake, AppSettings } from "../types/vault";
import { SAMPLE_QUESTIONS } from "./sampleData";

const DB_NAME = "ApexVaultDB";
const DB_VERSION = 1;
const STORE_QUESTIONS = "questions";
const STORE_SETTINGS = "settings";

const DEFAULT_SETTINGS: AppSettings = {
  googleDriveClientId: "",
  geminiModel: "gemini-3.8-flash",
  srsIntervals: {
    stage1: 3,
    stage2: 7,
    stage3: 21,
    stage4: 60,
  },
  autoAiAnalyzeOnPaste: true,
};

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
        const questionStore = db.createObjectStore(STORE_QUESTIONS, { keyPath: "id" });
        questionStore.createIndex("subject", "subject", { unique: false });
        questionStore.createIndex("chapter", "chapter", { unique: false });
        questionStore.createIndex("status", "status", { unique: false });
        questionStore.createIndex("errorType", "errorType", { unique: false });
        questionStore.createIndex("nextReviewDate", "nextReviewDate", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
    };

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Seed sample questions if first time
      const tx = db.transaction(STORE_QUESTIONS, "readonly");
      const countReq = tx.objectStore(STORE_QUESTIONS).count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) {
          const writeTx = db.transaction([STORE_QUESTIONS, STORE_SETTINGS], "readwrite");
          const qStore = writeTx.objectStore(STORE_QUESTIONS);
          SAMPLE_QUESTIONS.forEach((q) => qStore.put(q));
          writeTx.objectStore(STORE_SETTINGS).put({ key: "app_settings", value: DEFAULT_SETTINGS });
        }
      };

      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

export async function getAllQuestions(): Promise<QuestionMistake[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUESTIONS, "readonly");
    const store = tx.objectStore(STORE_QUESTIONS);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result as QuestionMistake[]) || [];
      // Sort newest created first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getQuestion(id: string): Promise<QuestionMistake | undefined> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUESTIONS, "readonly");
    const store = tx.objectStore(STORE_QUESTIONS);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveQuestion(question: QuestionMistake): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUESTIONS, "readwrite");
    const store = tx.objectStore(STORE_QUESTIONS);
    const req = store.put(question);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function bulkSaveQuestions(questions: QuestionMistake[]): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUESTIONS, "readwrite");
    const store = tx.objectStore(STORE_QUESTIONS);
    for (const q of questions) {
      store.put(q);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUESTIONS, "readwrite");
    const store = tx.objectStore(STORE_QUESTIONS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_SETTINGS, "readonly");
    const store = tx.objectStore(STORE_SETTINGS);
    const req = store.get("app_settings");
    req.onsuccess = () => {
      if (req.result && req.result.value) {
        resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    };
    req.onerror = () => resolve(DEFAULT_SETTINGS);
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SETTINGS, "readwrite");
    const store = tx.objectStore(STORE_SETTINGS);
    const req = store.put({ key: "app_settings", value: settings });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
