function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasTerm(text, term) {
  const haystack = text.toLowerCase();
  const needle = String(term).toLowerCase().trim();

  if (!needle) {
    return false;
  }

  if (needle.includes(" ") || /[^a-z0-9]/i.test(needle)) {
    return haystack.includes(needle);
  }

  return new RegExp(`\\b${escapeRegex(needle)}s?\\b`, "i").test(text);
}

function completenessFromLength(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (words === 0) {
    return 0;
  }
  if (words < 8) {
    return 28;
  }
  if (words < 18) {
    return 58;
  }
  if (words < 35) {
    return 82;
  }
  return 100;
}

export function evaluateAnswer(text, question) {
  const answer = text || "";
  const keywords = question?.keywords || [];
  const patterns = question?.patterns || [];

  const matchedKeywords = [];
  const missingKeywords = [];

  keywords.forEach((item) => {
    const terms = item.terms || [item.label];
    const matched = terms.some((term) => hasTerm(answer, term));

    if (matched) {
      matchedKeywords.push(item.label);
    } else {
      missingKeywords.push(item.label);
    }
  });

  const patternResults = patterns.map((item) => ({
    id: item.id,
    label: item.label,
    matched: item.regex.test(answer),
  }));

  const matchedPatterns = patternResults.filter((item) => item.matched);
  const keywordScore = keywords.length
    ? Math.round((matchedKeywords.length / keywords.length) * 100)
    : 0;
  const patternScore = patterns.length
    ? Math.round((matchedPatterns.length / patterns.length) * 100)
    : 0;
  const completeness = completenessFromLength(answer);

  const score = answer.trim()
    ? Math.round(keywordScore * 0.5 + patternScore * 0.35 + completeness * 0.15)
    : 0;

  let strength = "Start typing";
  if (answer.trim()) {
    if (score >= 80) {
      strength = "Strong";
    } else if (score >= 65) {
      strength = "Good";
    } else if (score >= 45) {
      strength = "Developing";
    } else {
      strength = "Weak";
    }
  }

  return {
    score,
    keywordScore,
    patternScore,
    completeness,
    matchedKeywords,
    missingKeywords,
    patternResults,
    matchedPatternCount: matchedPatterns.length,
    patternCount: patterns.length,
    keywordCount: keywords.length,
    strength,
  };
}
