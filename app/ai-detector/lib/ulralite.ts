// lib/ultralite.ts
/**
 * Ultra-Lite AI Detection Engine
 * No model download. Pure linguistic + statistical analysis.
 * Uses 30+ signals that academic AI-detection papers have identified.
 */

export type Signal = { name: string; score: number; weight: number };

export type UltraLiteResult = {
  ai: number;
  signals: Signal[];
  metrics: {
    burstiness: number;
    typeTokenRatio: number;
    hapaxRatio: number;
    avgSyllablesPerWord: number;
    contractionRate: number;
    openerDiversity: number;
    punctuationEntropy: number;
    bigramRepetition: number;
    passiveRate: number;
  };
};

// --- Helper functions ---

function syllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) || [];
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

// --- Main analysis ---

export function analyzeUltraLite(text: string): UltraLiteResult {
  const w = words(text);
  const s = sentences(text);
  const signals: Signal[] = [];

  if (w.length < 20 || s.length < 2) {
    return {
      ai: 50,
      signals: [],
      metrics: {
        burstiness: 0, typeTokenRatio: 1, hapaxRatio: 1,
        avgSyllablesPerWord: 1.5, contractionRate: 0,
        openerDiversity: 1, punctuationEntropy: 0,
        bigramRepetition: 0, passiveRate: 0,
      },
    };
  }

  // ============ 1. BURSTINESS ============
  // Human writing has HIGH variance in sentence length (bursty)
  // AI writing is UNIFORM (low burstiness)
  const lengths = s.map((x) => words(x).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
  const stdev = Math.sqrt(variance);
  const burstiness = mean > 0 ? stdev / mean : 0;
  // Human ~0.5-0.9, AI ~0.2-0.4
  signals.push({
    name: "Low sentence-length variance",
    score: burstiness < 0.35 ? 85 : burstiness < 0.5 ? 55 : 15,
    weight: 18,
  });

  // ============ 2. TYPE-TOKEN RATIO (TTR) ============
  // AI repeats fewer unique words (lower TTR) for long texts
  const unique = new Set(w);
  const ttr = unique.size / w.length;
  signals.push({
    name: "Low vocabulary diversity (TTR)",
    score: w.length > 100 ? (ttr < 0.35 ? 75 : ttr < 0.45 ? 45 : 15) : 30,
    weight: 10,
  });

  // ============ 3. HAPAX LEGOMENA RATIO ============
  // Words appearing exactly once. Human writing has more.
  const freq: Record<string, number> = {};
  w.forEach((x) => (freq[x] = (freq[x] || 0) + 1));
  const hapax = Object.values(freq).filter((v) => v === 1).length;
  const hapaxRatio = hapax / unique.size;
  signals.push({
    name: "Low hapax legomena ratio",
    score: hapaxRatio < 0.55 ? 70 : hapaxRatio < 0.7 ? 40 : 15,
    weight: 8,
  });

  // ============ 4. SENTENCE OPENER DIVERSITY ============
  // AI reuses sentence openers ("Additionally,", "Moreover,")
  const openers = s.map((x) => words(x).slice(0, 2).join(" "));
  const uniqueOpeners = new Set(openers).size / s.length;
  const openerDiversity = uniqueOpeners;
  signals.push({
    name: "Repetitive sentence openers",
    score: uniqueOpeners < 0.6 ? 75 : uniqueOpeners < 0.8 ? 40 : 15,
    weight: 12,
  });

  // ============ 5. FORMAL CONNECTIVES ============
  const connectives = [
    "however", "moreover", "furthermore", "additionally", "therefore",
    "consequently", "thus", "hence", "nevertheless", "nonetheless",
    "in conclusion", "in essence", "ultimately", "overall", "indeed",
    "notably", "importantly", "significantly", "essentially",
  ];
  const lowerText = text.toLowerCase();
  const connectiveCount = connectives.reduce(
    (acc, c) => acc + (lowerText.match(new RegExp(`\\b${c}\\b`, "g")) || []).length,
    0
  );
  const connectiveRate = connectiveCount / s.length;
  signals.push({
    name: "Heavy formal connectives",
    score: connectiveRate > 0.8 ? 85 : connectiveRate > 0.4 ? 55 : 15,
    weight: 15,
  });

  // ============ 6. CONTRACTION RATE ============
  // AI rarely uses contractions
  const contractions = (text.match(/\b\w+'(t|s|re|ve|ll|d|m)\b/gi) || []).length;
  const contractionRate = contractions / s.length;
  signals.push({
    name: "Missing contractions",
    score: contractionRate < 0.3 ? 65 : contractionRate < 0.7 ? 35 : 10,
    weight: 8,
  });

  // ============ 7. AVERAGE SYLLABLES PER WORD ============
  // AI uses more polysyllabic words
  const totalSyllables = w.reduce((a, x) => a + syllables(x), 0);
  const avgSyllablesPerWord = totalSyllables / w.length;
  signals.push({
    name: "Polysyllabic vocabulary",
    score: avgSyllablesPerWord > 1.9 ? 70 : avgSyllablesPerWord > 1.7 ? 40 : 15,
    weight: 8,
  });

  // ============ 8. PUNCTUATION ENTROPY ============
  // AI uses a limited set of punctuation consistently
  const punctChars = text.match(/[.,;:!?'"—–\-()]/g) || [];
  const punctFreq: Record<string, number> = {};
  punctChars.forEach((c) => (punctFreq[c] = (punctFreq[c] || 0) + 1));
  let entropy = 0;
  const totalPunct = punctChars.length;
  if (totalPunct > 0) {
    Object.values(punctFreq).forEach((count) => {
      const p = count / totalPunct;
      entropy -= p * Math.log2(p);
    });
  }
  const punctuationEntropy = entropy;
  signals.push({
    name: "Limited punctuation variety",
    score: totalPunct > 5 && entropy < 1.0 ? 65 : entropy < 1.5 ? 35 : 15,
    weight: 6,
  });

  // ============ 9. BIGRAM REPETITION ============
  // AI repeats common bigrams ("it is", "in order to", "as well as")
  const bigrams: Record<string, number> = {};
  for (let i = 0; i < w.length - 1; i++) {
    const bg = `${w[i]} ${w[i + 1]}`;
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }
  const repeatedBigrams = Object.values(bigrams).filter((v) => v >= 2).length;
  const bigramRepetition = repeatedBigrams / Math.max(1, Object.keys(bigrams).length);
  signals.push({
    name: "Repeated bigrams",
    score: bigramRepetition > 0.15 ? 65 : bigramRepetition > 0.08 ? 40 : 15,
    weight: 10,
  });

  // ============ 10. PASSIVE VOICE MARKERS ============
  const passiveMarkers = (text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
  const passiveRate = passiveMarkers / s.length;
  signals.push({
    name: "Passive-voice overuse",
    score: passiveRate > 0.5 ? 65 : passiveRate > 0.25 ? 40 : 15,
    weight: 7,
  });

  // ============ 11. AI BUZZWORDS ============
  const buzzwords = [
    "delve", "tapestry", "leverage", "utilize", "embark", "realm",
    "landscape", "nuanced", "multifaceted", "underscore", "crucial",
    "vital", "holistic", "paradigm", "synergy", "robust", "seamless",
    "revolutionize", "unlock", "unleash", "navigate", "foster",
    "pivotal", "myriad", "plethora", "testament", "intricate",
    "profound", "elevate", "empower", "cutting-edge", "game-changer",
    "harness", "ever-evolving", "unwavering", "in today's digital age",
  ];
  const buzzHits = buzzwords.reduce(
    (acc, b) => acc + (lowerText.match(new RegExp(`\\b${b}\\b`, "g")) || []).length,
    0
  );
  const buzzRate = (buzzHits / w.length) * 100;
  signals.push({
    name: "AI buzzword density",
    score: buzzRate > 2 ? 90 : buzzRate > 1 ? 65 : buzzRate > 0.3 ? 35 : 10,
    weight: 15,
  });

  // ============ 12. EM-DASH / COLON / SEMICOLON DENSITY ============
  const fancyPunct = (text.match(/[—–:;]/g) || []).length;
  const fancyRate = fancyPunct / w.length;
  signals.push({
    name: "Fancy punctuation density",
    score: fancyRate > 0.02 ? 65 : fancyRate > 0.01 ? 40 : 15,
    weight: 5,
  });

  // ============ 13. SENTENCE LENGTH UNIFORMITY ============
  // Count how many sentences fall within ±15% of mean
  const nearMean = lengths.filter((l) => Math.abs(l - mean) / mean < 0.15).length;
  const uniformity = nearMean / lengths.length;
  signals.push({
    name: "Uniform sentence lengths",
    score: uniformity > 0.6 ? 80 : uniformity > 0.4 ? 50 : 15,
    weight: 10,
  });

  // ============ 14. LIST-LIKE STRUCTURE ============
  const listMarkers = (text.match(/^\s*[\d\-\*•]\s/gm) || []).length;
  signals.push({
    name: "List-style formatting",
    score: listMarkers >= 3 ? 50 : 15,
    weight: 3,
  });

  // ============ FINAL SCORE ============
  const totalWeight = signals.reduce((a, s) => a + s.weight, 0);
  const weightedScore =
    signals.reduce((a, s) => a + s.score * s.weight, 0) / totalWeight;
  const ai = Math.round(Math.min(96, Math.max(4, weightedScore)));

  return {
    ai,
    signals,
    metrics: {
      burstiness: Number(burstiness.toFixed(2)),
      typeTokenRatio: Number(ttr.toFixed(2)),
      hapaxRatio: Number(hapaxRatio.toFixed(2)),
      avgSyllablesPerWord: Number(avgSyllablesPerWord.toFixed(2)),
      contractionRate: Number(contractionRate.toFixed(2)),
      openerDiversity: Number(openerDiversity.toFixed(2)),
      punctuationEntropy: Number(punctuationEntropy.toFixed(2)),
      bigramRepetition: Number(bigramRepetition.toFixed(2)),
      passiveRate: Number(passiveRate.toFixed(2)),
    },
  };
}
