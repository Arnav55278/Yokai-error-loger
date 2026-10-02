export interface GeminiVisionResult {
  subject: string;
  unit: string;
  chapter: string;
  subtopic: string;
  ocrText: string;
  keyConcept: string;
  level: string;
  suggestedErrorType: string;
  suggestedTags: string[];
}

export async function checkServerStatus(): Promise<{ hasApiKey: boolean; status: string }> {
  try {
    const res = await fetch("/api/status");
    if (res.ok) {
      return await res.json();
    }
    return { hasApiKey: false, status: "error" };
  } catch {
    return { hasApiKey: false, status: "offline" };
  }
}

export async function testGeminiApiKey(
  apiKey?: string,
  model?: string
): Promise<{ success: boolean; model: string; reply?: string; error?: string }> {
  try {
    const res = await fetch("/api/gemini/test-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, model }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, model: model || "gemini-3.8-flash", error: data.error || "Failed to verify API key" };
    }
    return data;
  } catch (err: any) {
    return { success: false, model: model || "gemini-3.8-flash", error: err.message || "Network error testing key" };
  }
}

export async function analyzeQuestionWithVision(
  questionImage: string,
  solutionImage?: string,
  model?: string,
  apiKey?: string
): Promise<GeminiVisionResult> {
  const res = await fetch("/api/gemini/analyze-question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questionImage,
      solutionImage,
      model,
      apiKey,
    }),
  });

  if (!res.ok) {
    let errMessage = "Failed to analyze question with AI Vision";
    try {
      const errData = await res.json();
      if (errData.error) errMessage = errData.error;
    } catch {
      errMessage = await res.text();
    }
    throw new Error(errMessage);
  }

  return await res.json();
}

export async function generateAiHint(params: {
  questionImage?: string;
  ocrText?: string;
  subtopic?: string;
  chapter?: string;
  tier: 1 | 2 | 3;
  model?: string;
  apiKey?: string;
}): Promise<string> {
  const res = await fetch("/api/gemini/generate-hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let errMessage = "Failed to generate AI hint";
    try {
      const errData = await res.json();
      if (errData.error) errMessage = errData.error;
    } catch {
      errMessage = await res.text();
    }
    throw new Error(errMessage);
  }

  const data = await res.json();
  return data.hint || "No hint returned.";
}

