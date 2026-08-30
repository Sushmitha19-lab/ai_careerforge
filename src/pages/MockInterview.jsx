import React, { useEffect, useRef, useState } from "react";

import {
  emotionLabel,
  emptyBehavior,
  integrityLabel,
  summarizeBehavior,
} from "../utils/summarizeBehavior";
import { evaluateAnswer } from "../utils/evaluateAnswer";
import {
  QUESTIONS_PER_ROUND,
  ROUND_COUNT,
  ROUND_PASS_SCORE,
  formatPrompt,
  getQuestionById,
  levelLabel,
  passedRound,
  pickRoundQuestions,
  preferredLevel,
  roundAverage,
  scoreBand,
  typeLabel,
} from "../utils/adaptiveInterview";
import { accentLabel, localAccentScore } from "../utils/accentScore";
import { liveVoiceStats } from "../utils/voiceMetrics";
import { loadFlow, saveFlow } from "../utils/session";
import { roundsForCourse } from "../data/tracks";
import { buildRoundFeedback } from "../utils/roundFeedback";
import { RoundFeedbackPanel } from "../components/RoundFeedbackPanel";

function restoreOrStartRound(course, company, saved) {
  if (saved?.roundQuestionIds?.length) {
    const questions = saved.roundQuestionIds
      .map((id) => getQuestionById(id))
      .filter(Boolean);
    if (questions.length) {
      return {
        roundIndex: saved.roundIndex || 0,
        questions,
        drafts: questions.map((_, index) => saved.roundDrafts?.[index] || ""),
        currentQ: Math.min(saved.currentQ || 0, questions.length - 1),
        phase: saved.phase === "round-result" ? "round-result" : "questions",
        committed: saved.answers || [],
        askedIds: saved.askedIds || questions.map((item) => item.id),
        lastRoundResult: saved.lastRoundResult || null,
        roundReports: saved.roundReports || [],
        roundName:
          saved.roundName ||
          roundsForCourse(course)[saved.roundIndex || 0]?.name ||
          "Aptitude",
      };
    }
  }

  const pack = pickRoundQuestions(course, 0, [], "foundation");
  return {
    roundIndex: 0,
    questions: pack.questions,
    drafts: pack.questions.map(() => ""),
    currentQ: 0,
    phase: "questions",
    committed: [],
    askedIds: pack.questions.map((item) => item.id),
    lastRoundResult: null,
    roundReports: [],
    roundName: pack.round?.name || "Aptitude",
  };
}

function MockInterview({
  company,
  course,
  onBack,
  onFinish,
}) {
  const savedInterview = (() => {
    const saved = loadFlow().interview;
    if (!saved) {
      return null;
    }
    if (saved.companyId && saved.companyId !== company?.id) {
      return null;
    }
    if (saved.courseId && saved.courseId !== course?.id) {
      return null;
    }
    return saved;
  })();
  const [boot] = useState(() => restoreOrStartRound(course, company, savedInterview));
  const [roundIndex, setRoundIndex] = useState(boot.roundIndex);
  const [roundQuestions, setRoundQuestions] = useState(boot.questions);
  const [drafts, setDrafts] = useState(boot.drafts);
  const [currentQ, setCurrentQ] = useState(boot.currentQ);
  const [phase, setPhase] = useState(boot.phase);
  const [difficulty, setDifficulty] = useState(
    levelLabel(boot.questions[boot.currentQ]?.level)
  );
  const [adaptiveNote, setAdaptiveNote] = useState(
    `Round ${boot.roundIndex + 1} of ${ROUND_COUNT}. Use Previous / Next to move between questions. After all ${QUESTIONS_PER_ROUND} answers, submit this round. You need ${ROUND_PASS_SCORE}% to open the next round.`
  );
  const [roundName, setRoundName] = useState(boot.roundName);
  const [askedIds, setAskedIds] = useState(boot.askedIds);
  const [answers, setAnswers] = useState(boot.committed);
  const [lastRoundResult, setLastRoundResult] = useState(boot.lastRoundResult);
  const [roundReports, setRoundReports] = useState(boot.roundReports || []);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [listening, setListening] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState(null);
  const [voiceError, setVoiceError] = useState("");
  const [liveVoice, setLiveVoice] = useState({ wpm: 0, wordCount: 0 });
  const [draft, setDraft] = useState("");
  const [heardInterim, setHeardInterim] = useState("");
  const [mediaConsent, setMediaConsent] = useState(
    savedInterview?.mediaConsent || null
  );

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const samplesRef = useRef([]);
  const analyzingRef = useRef(false);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const voiceStartedAtRef = useRef(0);
  const voiceFinalRef = useRef("");
  const voiceInterimRef = useRef("");
  const voiceConfidenceRef = useRef([]);
  const pauseCountRef = useRef(0);
  const answerWhenStartedRef = useRef("");
  const questionRef = useRef(null);
  const voiceAnalysisRef = useRef(null);
  const textareaRef = useRef(null);
  const answerRef = useRef("");
  const draftTimerRef = useRef(null);
  const submittingRef = useRef(false);
  const currentQRef = useRef(boot.currentQ);
  const draftsRef = useRef(boot.drafts);
  const roundVoicesRef = useRef(boot.questions.map(() => null));
  const roundSampleOffsetRef = useRef(0);
  const roundReportsRef = useRef(boot.roundReports || []);
  const mountedRef = useRef(true);
  const voiceGenRef = useRef(0);
  const sessionIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}`
  );

  const question = roundQuestions[currentQ] || roundQuestions[0];
  const questionInRound = currentQ + 1;
  const roundNumber = roundIndex + 1;
  const isLastRound = roundIndex + 1 >= ROUND_COUNT;
  const answeredInRound = drafts.filter((item) => String(item || "").trim()).length;
  const canSubmitRound =
    roundQuestions.length > 0 &&
    answeredInRound >= roundQuestions.length;
  const progress = roundQuestions.length
    ? (answeredInRound / roundQuestions.length) * 100
    : 0;
  const prompt = formatPrompt(question, company);
  questionRef.current = question;
  voiceAnalysisRef.current = voiceAnalysis;
  currentQRef.current = currentQ;
  draftsRef.current = drafts;

  const readAnswer = () => {
    if (textareaRef.current) {
      return textareaRef.current.value;
    }
    return answerRef.current;
  };

  const scheduleDraft = (text) => {
    answerRef.current = text;
    const index = currentQRef.current;
    setDrafts((previous) => {
      const next = [...previous];
      next[index] = text;
      draftsRef.current = next;
      return next;
    });
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }
    draftTimerRef.current = setTimeout(() => {
      setDraft(text);
    }, 120);
  };

  const clearAnswerBox = () => {
    answerRef.current = "";
    setDraft("");
    setHeardInterim("");
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    }
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  };


  const attachStream = (stream) => {
    streamRef.current = stream;
    setCameraOpen(true);
    setCameraError("");
  };


  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    streamRef.current = null;
    setCameraOpen(false);
    setLiveAnalysis(null);
  };


  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });

      attachStream(stream);
    } catch (error) {
      setCameraError(
        "Camera permission was not granted. Emotion and integrity analysis cannot run."
      );
      setCameraOpen(false);
    }
  };


  const toggleCamera = async () => {
    if (cameraOpen) {
      stopCamera();
      return;
    }

    await startCamera();
  };


  const captureAndAnalyze = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !mountedRef.current ||
      document.hidden ||
      !video ||
      !canvas ||
      analyzingRef.current ||
      video.readyState < 2 ||
      !video.videoWidth
    ) {
      return;
    }

    analyzingRef.current = true;

    try {
      const scale = 320 / video.videoWidth;
      canvas.width = 320;
      canvas.height = Math.round(video.videoHeight * scale);

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.72)
      );

      if (!blob) {
        return;
      }

      const form = new FormData();
      form.append("frame", blob, "frame.jpg");
      form.append("session_id", sessionIdRef.current);

      const response = await fetch("/ml/analyze-emotion", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      if (!mountedRef.current) {
        return;
      }

      samplesRef.current =
        samplesRef.current.length < 400
          ? [...samplesRef.current, data]
          : [...samplesRef.current.slice(1), data];
      setLiveAnalysis((previous) => {
        if (
          previous &&
          previous.emotion === data.emotion &&
          previous.confidence === data.confidence &&
          previous.nervousness === data.nervousness &&
          previous.integrity === data.integrity &&
          previous.cheating_risk === data.cheating_risk
        ) {
          return previous;
        }
        return data;
      });
      setServiceError((previous) => (previous ? "" : previous));
    } catch (error) {
      if (mountedRef.current) {
        setServiceError(
          "Camera analysis is offline. Start the ML service on port 5001."
        );
      }
    } finally {
      analyzingRef.current = false;
    }
  };


  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);


  useEffect(() => {
    if (!mediaConsent) {
      return;
    }
    saveFlow({
      interview: {
        questionId: question?.id,
        difficulty,
        adaptiveNote,
        roundName,
        askedIds,
        answers,
        mediaConsent,
        courseId: course?.id,
        companyId: company?.id,
        roundIndex,
        currentQ,
        phase,
        roundQuestionIds: roundQuestions.map((item) => item.id),
        roundDrafts: drafts,
        lastRoundResult,
        roundReports,
      },
    });
  }, [
    question?.id,
    difficulty,
    adaptiveNote,
    roundName,
    askedIds,
    answers,
    mediaConsent,
    course?.id,
    company?.id,
    roundIndex,
    currentQ,
    phase,
    roundQuestions,
    drafts,
    lastRoundResult,
    roundReports,
  ]);


  useEffect(() => {
    if (mediaConsent !== "camera") {
      return;
    }

    let cancelled = false;

    const boot = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        attachStream(stream);
      } catch (error) {
        if (!cancelled) {
          setCameraError(
            "Camera permission was not granted. Emotion and integrity analysis cannot run."
          );
        }
      }
    };

    boot();

    return () => {
      cancelled = true;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [mediaConsent]);


  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen]);


  useEffect(() => {
    if (!cameraOpen) {
      return;
    }

    const timer = setInterval(captureAndAnalyze, 1400);
    const first = setTimeout(captureAndAnalyze, 600);

    return () => {
      clearInterval(timer);
      clearTimeout(first);
    };
  }, [cameraOpen]);


  const appendSpokenText = (spoken) => {
    const piece = String(spoken || "").trim();
    if (!piece) {
      return;
    }

    const field = textareaRef.current;
    const current = field ? field.value : answerRef.current;
    const needsSpace = current && !/\s$/.test(current);
    const next = `${current}${needsSpace ? " " : ""}${piece}`;

    if (field) {
      field.value = next;
    }
    scheduleDraft(next);
  };


  const analyzeSpokenAnswer = async (transcript, duration, confidence, pauseCount) => {
    const gen = voiceGenRef.current;
    const spokenEval = evaluateAnswer(transcript, questionRef.current);

    try {
      const response = await fetch("/ml/analyze-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          duration_seconds: duration,
          speech_confidence: confidence,
          keyword_score: spokenEval.keywordScore,
          pattern_score: spokenEval.patternScore,
          pause_count: pauseCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Voice analysis failed");
      }

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Voice analysis failed");
      }

      const withAccent = {
        ...data,
        accent:
          typeof data.accent === "number"
            ? data.accent
            : localAccentScore({
                confidence,
                wpm: liveVoiceStats(transcript, duration).wpm,
                wordCount: liveVoiceStats(transcript, duration).wordCount,
              }),
        accent_label:
          data.accent_label ||
          accentLabel(
            typeof data.accent === "number" ? data.accent : 0
          ),
      };
      if (!data.accent_label) {
        withAccent.accent_label = accentLabel(withAccent.accent);
      }

      if (gen !== voiceGenRef.current || !mountedRef.current) {
        return withAccent;
      }

      voiceAnalysisRef.current = withAccent;
      setVoiceAnalysis(withAccent);
      setVoiceError("");
      return withAccent;
    } catch (error) {
      const stats = liveVoiceStats(transcript, duration);
      const accent = localAccentScore({
        confidence,
        wpm: stats.wpm,
        wordCount: stats.wordCount,
      });
      const fallback = {
        ok: true,
        fluency: accent,
        accuracy: spokenEval.keywordScore,
        accent,
        accent_label: accentLabel(accent),
        notes: [
          "Voice ML is offline. Accent/clarity used speech-recognition confidence on this machine.",
        ],
      };
      if (gen === voiceGenRef.current && mountedRef.current) {
        setVoiceError(
          "Voice ML is offline. Accent and fluency used a local clarity estimate."
        );
        voiceAnalysisRef.current = fallback;
        setVoiceAnalysis(fallback);
      }
      return fallback;
    }
  };


  const finishVoiceSession = () => {
    const spoken = voiceFinalRef.current.trim();
    const duration = Math.max(
      0.4,
      (Date.now() - voiceStartedAtRef.current) / 1000
    );
    const confidences = voiceConfidenceRef.current;
    const confidence = confidences.length
      ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length
      : 0.7;

    setLiveVoice(liveVoiceStats(spoken, duration));

    if (spoken) {
      return analyzeSpokenAnswer(
        spoken,
        duration,
        confidence,
        pauseCountRef.current
      );
    }
    return null;
  };


  const stopVoice = () => {
    listeningRef.current = false;
    setListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (error) {
        /* already stopped */
      }
      recognitionRef.current = null;
    }

    setHeardInterim("");
    finishVoiceSession();
  };


  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Try Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    voiceFinalRef.current = "";
    voiceInterimRef.current = "";
    voiceConfidenceRef.current = [];
    pauseCountRef.current = 0;
    answerWhenStartedRef.current = readAnswer();
    voiceStartedAtRef.current = Date.now();
    listeningRef.current = true;
    recognitionRef.current = recognition;
    setVoiceError("");
    setHeardInterim("");
    setListening(true);

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0];
        if (event.results[i].isFinal) {
          voiceFinalRef.current = `${voiceFinalRef.current} ${piece.transcript}`.trim();
          voiceConfidenceRef.current.push(
            typeof piece.confidence === "number" ? piece.confidence : 0.75
          );
          appendSpokenText(piece.transcript);
        } else {
          interim = piece.transcript;
        }
      }

      voiceInterimRef.current = interim;
      setHeardInterim(interim);
    };

    recognition.onerror = (event) => {
      if (!listeningRef.current) {
        return;
      }
      if (event?.error === "aborted" || event?.error === "no-speech") {
        return;
      }
      setVoiceError("Microphone recognition was interrupted. Try speaking again.");
    };

    recognition.onend = () => {
      if (!listeningRef.current) {
        return;
      }

      try {
        recognition.start();
      } catch (error) {
        listeningRef.current = false;
        setListening(false);
        finishVoiceSession();
      }
    };

    try {
      recognition.start();
    } catch (error) {
      listeningRef.current = false;
      setListening(false);
      alert("Could not start the microphone.");
    }
  };


  const toggleVoice = () => {
    if (listening) {
      stopVoice();
      return;
    }
    startVoice();
  };


  useEffect(() => {
    if (!listening) {
      return;
    }

    const timer = setInterval(() => {
      const spoken = `${voiceFinalRef.current} ${voiceInterimRef.current}`.trim();
      const duration = (Date.now() - voiceStartedAtRef.current) / 1000;
      setLiveVoice(liveVoiceStats(spoken, duration));
    }, 400);

    return () => clearInterval(timer);
  }, [listening]);


  useEffect(() => {
    return () => {
      listeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (error) {
          /* ignore */
        }
      }
    };
  }, []);


  const currentEmotion = liveAnalysis?.emotion || "neutral";

  const stashCurrentVoice = () => {
    const index = currentQRef.current;
    roundVoicesRef.current[index] = voiceAnalysisRef.current;
  };

  const loadVoiceForIndex = (index) => {
    const stored = roundVoicesRef.current[index] || null;
    voiceAnalysisRef.current = stored;
    setVoiceAnalysis(stored);
  };

  const persistCurrentDraft = () => {
    const text = readAnswer();
    const index = currentQRef.current;
    setDrafts((previous) => {
      const next = [...previous];
      next[index] = text;
      draftsRef.current = next;
      return next;
    });
    stashCurrentVoice();
    return text;
  };

  const showQuestionAt = (index) => {
    if (index < 0 || index >= roundQuestions.length) {
      return;
    }
    persistCurrentDraft();
    setCurrentQ(index);
    currentQRef.current = index;
    const nextQuestion = roundQuestions[index];
    setDifficulty(levelLabel(nextQuestion?.level));
    const text = draftsRef.current[index] || "";
    answerRef.current = text;
    setDraft(text);
    setHeardInterim("");
    loadVoiceForIndex(index);
  };

  const buildAnswerRecordFor = (item, text, voice) => {
    const analysis = evaluateAnswer(text, item);
    return {
      question: formatPrompt(item, company),
      questionId: item.id,
      answer: text,
      score: analysis.score,
      scoreBand: scoreBand(analysis.score),
      difficulty: levelLabel(item.level),
      topic: item.topic,
      type: item.type,
      roundName,
      adaptiveReason: adaptiveNote,
      emotion: currentEmotion,
      keywordScore: analysis.keywordScore,
      patternScore: analysis.patternScore,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      voiceFluency: voice?.fluency,
      voiceAccuracy: voice?.accuracy,
      voiceAccent: voice?.accent,
      voiceLabel: voice?.fluency_label,
      voiceNotes: voice?.notes || [],
    };
  };

  const submitRound = async () => {
    if (submittingRef.current) {
      return;
    }
    persistCurrentDraft();
    const latestDrafts = draftsRef.current;
    if (latestDrafts.some((item) => !String(item || "").trim())) {
      return;
    }
    submittingRef.current = true;
    try {
      if (listeningRef.current) {
        listeningRef.current = false;
        setListening(false);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
          } catch (error) {
            /* already stopped */
          }
          recognitionRef.current = null;
        }
        await finishVoiceSession();
        stashCurrentVoice();
      }

      const records = roundQuestions.map((item, index) =>
        buildAnswerRecordFor(
          item,
          latestDrafts[index] || "",
          roundVoicesRef.current[index]
        )
      );
      const average = roundAverage(records);
      const passed = passedRound(average);
      const roundSamples = samplesRef.current.slice(
        roundSampleOffsetRef.current
      );
      const faceSummary = summarizeBehavior(roundSamples);
      const roundId =
        roundQuestions[0]?.type ||
        roundsForCourse(course)[roundIndex]?.id ||
        "technical";
      const feedback = buildRoundFeedback({
        answers: records,
        behavior: faceSummary,
        course,
        roundId,
      });
      const report = {
        roundName,
        roundNumber: roundIndex + 1,
        roundId,
        answers: records,
        average,
        passed,
        feedback,
      };
      const reports = [
        ...roundReportsRef.current.filter(
          (item) => item.roundNumber !== roundIndex + 1
        ),
        report,
      ];
      roundReportsRef.current = reports;
      setRoundReports(reports);
      setLastRoundResult(report);
      setPhase("round-result");
    } finally {
      submittingRef.current = false;
    }
  };

  const retryRound = () => {
    setLastRoundResult(null);
    setPhase("questions");
    setCurrentQ(0);
    currentQRef.current = 0;
    const text = draftsRef.current[0] || "";
    answerRef.current = text;
    setDraft(text);
    loadVoiceForIndex(0);
    setAdaptiveNote(
      `Review and edit this round, then submit again. You need ${ROUND_PASS_SCORE}% to continue.`
    );
  };

  const startNextRound = () => {
    if (!lastRoundResult?.passed) {
      return;
    }
    const committed = [...answers, ...lastRoundResult.answers];
    setAnswers(committed);
    if (roundIndex + 1 >= ROUND_COUNT) {
      finishInterview(committed);
      return;
    }
    const nextIndex = roundIndex + 1;
    const pack = pickRoundQuestions(
      course,
      nextIndex,
      askedIds,
      preferredLevel(lastRoundResult.average)
    );
    const nextAsked = [
      ...askedIds,
      ...pack.questions.map((item) => item.id),
    ];
    setAskedIds(nextAsked);
    setRoundIndex(nextIndex);
    setRoundQuestions(pack.questions);
    const empty = pack.questions.map(() => "");
    setDrafts(empty);
    draftsRef.current = empty;
    roundVoicesRef.current = pack.questions.map(() => null);
    setCurrentQ(0);
    currentQRef.current = 0;
    setRoundName(pack.round?.name || roundsForCourse(course)[nextIndex]?.name);
    setDifficulty(levelLabel(pack.questions[0]?.level));
    setAdaptiveNote(
      `You passed ${lastRoundResult.roundName} with ${lastRoundResult.average}%. Round ${nextIndex + 1} of ${ROUND_COUNT}: ${pack.round?.name}. Answer all ${QUESTIONS_PER_ROUND}, then submit.`
    );
    setLastRoundResult(null);
    setPhase("questions");
    roundSampleOffsetRef.current = samplesRef.current.length;
    clearAnswerBox();
    setVoiceAnalysis(null);
    voiceAnalysisRef.current = null;
  };


  const finishInterview = async (finalAnswers) => {
    persistCurrentDraft();
    let packed = Array.isArray(finalAnswers) ? [...finalAnswers] : [...answers];
    if (
      lastRoundResult?.answers?.length &&
      !packed.some(
        (item) => item.questionId === lastRoundResult.answers[0].questionId
      )
    ) {
      packed = [...packed, ...lastRoundResult.answers];
    }
    if (packed.length === 0 && roundQuestions.length) {
      packed = roundQuestions.map((item, index) =>
        buildAnswerRecordFor(
          item,
          draftsRef.current[index] || readAnswer(),
          roundVoicesRef.current[index]
        )
      );
    }

    const scores = packed.map((item) => item.score);

    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
          )
        : 0;

    const keywordAverage =
      packed.length > 0
        ? Math.round(
            packed.reduce(
              (sum, item) => sum + (item.keywordScore || item.score || 0),
              0
            ) / packed.length
          )
        : 0;

    const patternAverage =
      packed.length > 0
        ? Math.round(
            packed.reduce(
              (sum, item) => sum + (item.patternScore || item.score || 0),
              0
            ) / packed.length
          )
        : 0;

    const voiceAnswers = packed.filter(
      (item) => typeof item.voiceFluency === "number"
    );
    const voice = voiceAnswers.length
      ? {
          used: true,
          fluency: Math.round(
            voiceAnswers.reduce((sum, item) => sum + item.voiceFluency, 0) /
              voiceAnswers.length
          ),
          accuracy: Math.round(
            voiceAnswers.reduce(
              (sum, item) => sum + (item.voiceAccuracy || 0),
              0
            ) / voiceAnswers.length
          ),
          accent: Math.round(
            voiceAnswers.reduce(
              (sum, item) => sum + (item.voiceAccent || item.voiceFluency || 0),
              0
            ) / voiceAnswers.length
          ),
          notes: [
            ...new Set(voiceAnswers.flatMap((item) => item.voiceNotes || [])),
          ].slice(0, 4),
        }
      : {
          used: false,
          fluency: 0,
          accuracy: 0,
          accent: 0,
          notes: [],
        };

    const technical = Math.min(100, keywordAverage);
    const communication = Math.min(
      100,
      voice.used
        ? Math.round((patternAverage + voice.fluency) / 2)
        : patternAverage
    );
    const problemSolving = Math.max(0, average);
    const behavior = summarizeBehavior(samplesRef.current);

    saveFlow({ interview: null });
    await onFinish({
      overall: average,
      technical,
      communication,
      problemSolving,
      answers: packed,
      behavior: samplesRef.current.length ? behavior : emptyBehavior(),
      voice,
      roundReports: roundReportsRef.current,
    });
  };


  const wordCount = draft.trim()
    ? draft.trim().split(/\s+/).length
    : 0;

  const bbox = liveAnalysis?.bbox;
  const integrity = liveAnalysis?.integrity || "clear";

  if (!mediaConsent) {
    return (
      <div className="interview-page">
        <header className="interview-header">
          <button className="back-button" onClick={onBack}>
            ← Preparation
          </button>
          <div className="interview-brand">
            <div className="brand-mark">C</div>
            <strong>CareerForge</strong>
          </div>
          <span className="interview-company">
            {company?.name} · {course?.name}
          </span>
        </header>
        <main className="interview-container">
          <section className="consent-card">
            <p className="eyebrow">BEFORE WE START</p>
            <h1>Camera and microphone consent</h1>
            <p>
              This mock can analyse your camera for presence and
              expression, and your microphone when you choose to
              speak. Frames and transcripts go to the CareerForge
              ML service on this machine for this session only.
              They are not used to grade the wording of your
              written answer.
            </p>
            <ul>
              <li>Camera starts only if you allow it below.</li>
              <li>The microphone starts only when you press Start Voice Analysis.</li>
              <li>You can continue with typed answers only.</li>
            </ul>
            <div className="consent-actions">
              <button
                className="secondary-action"
                onClick={() => setMediaConsent("skip")}
              >
                Continue without camera
              </button>
              <button
                className="primary-action"
                onClick={() => setMediaConsent("camera")}
              >
                Allow camera analysis
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }


  if (phase === "round-result" && lastRoundResult) {
    const roundFeedback =
      lastRoundResult.feedback ||
      buildRoundFeedback({
        answers: lastRoundResult.answers || [],
        behavior: emptyBehavior(),
        course,
        roundId: lastRoundResult.roundId || roundQuestions[0]?.type || "technical",
      });

    return (
      <div className="interview-page">
        <header className="interview-header">
          <button className="back-button" onClick={onBack}>
            ← Preparation
          </button>
          <div className="interview-brand">
            <div className="brand-mark">C</div>
            <strong>CareerForge</strong>
          </div>
          <span className="interview-company">
            {company?.name} · {course?.name}
          </span>
        </header>
        <main className="interview-container round-result-container">
          <section className="consent-card round-gate-card">
            <p className="eyebrow">
              ROUND {lastRoundResult.roundNumber} OF {ROUND_COUNT}
            </p>
            <h1>{lastRoundResult.roundName} result</h1>
            <p className={lastRoundResult.passed ? "round-pass" : "round-fail"}>
              {lastRoundResult.passed
                ? `Passed with ${lastRoundResult.average}%. You can continue.`
                : `Scored ${lastRoundResult.average}%. You need ${ROUND_PASS_SCORE}% to open the next round.`}
            </p>
            <div className="round-gate-score">
              <strong>{lastRoundResult.average}%</strong>
              <span>
                {lastRoundResult.answers.length} questions · pass mark{" "}
                {ROUND_PASS_SCORE}%
              </span>
            </div>
            <RoundFeedbackPanel feedback={roundFeedback} />
            <ul className="round-gate-list">
              {lastRoundResult.answers.map((item, index) => (
                <li key={item.questionId || index}>
                  <span>
                    Q{index + 1}
                    {item.difficulty ? ` · ${item.difficulty}` : ""}
                  </span>
                  <strong>{item.score || 0}%</strong>
                </li>
              ))}
            </ul>
            <div className="consent-actions">
              {lastRoundResult.passed ? (
                <button className="primary-action" onClick={startNextRound}>
                  {isLastRound
                    ? "View full interview result →"
                    : `Start Round ${roundIndex + 2} →`}
                </button>
              ) : (
                <button className="primary-action" onClick={retryRound}>
                  Review answers & retry this round
                </button>
              )}
              <button className="ghost-action" onClick={() => finishInterview()}>
                End interview
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }


  return (
    <div className="interview-page">

      <header className="interview-header">
        <button className="back-button" onClick={onBack}>
          ← Preparation
        </button>

        <div className="interview-brand">
          <div className="brand-mark">C</div>
          <strong>CareerForge</strong>
        </div>

        <span className="interview-company">
          {company?.name} · {course?.name}
        </span>
      </header>


      <main className="interview-container">

        <div className="interview-heading">
          <div>
            <p className="eyebrow">ADAPTIVE INTERVIEW</p>
            <h1>{roundName}</h1>
            <p>
              Round {roundNumber} of {ROUND_COUNT} · Question {questionInRound} of{" "}
              {roundQuestions.length || QUESTIONS_PER_ROUND} · {difficulty} ·{" "}
              {typeLabel(question?.type, course)}
            </p>
          </div>

          <button
            className="end-button"
            onClick={() => finishInterview()}
          >
            End Interview
          </button>
        </div>


        <div className="interview-progress">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>


        <div className="question-meta">
          Question {questionInRound} of {roundQuestions.length} · {roundName} ·{" "}
          {answeredInRound}/{roundQuestions.length} answered
          <span className="level-pill">{difficulty}</span>
        </div>

        <p className="adaptive-banner">{adaptiveNote}</p>

        <div className="question-stepper" role="navigation" aria-label="Questions in this round">
          {roundQuestions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`question-step ${index === currentQ ? "current" : ""} ${
                String(drafts[index] || "").trim() ? "done" : ""
              }`}
              onClick={() => showQuestionAt(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>


        <section className="question-card">

          <h2>{prompt}</h2>

          <label className="section-label" htmlFor="interview-answer">
            YOUR ANSWER
          </label>
          <textarea
            id="interview-answer"
            key={`${roundIndex}-${currentQ}-${question?.id}`}
            ref={textareaRef}
            defaultValue={drafts[currentQ] || ""}
            onInput={(e) => scheduleDraft(e.target.value)}
            placeholder="Answer as you would in a corporate interview: definition, trade-off, and a workplace example."
          />
          {heardInterim ? (
            <p className="behavior-note">
              Hearing: {heardInterim}
            </p>
          ) : null}


          <div className="answer-support">
            <div className="answer-support-top">
              <p className="section-label">RESPONSE</p>
              <strong>
                {wordCount ? `${wordCount} words` : "Not started"}
              </strong>
            </div>
            <p className="behavior-note">
              Use Previous / Next to move through all {roundQuestions.length}{" "}
              questions. Scoring happens when you submit this round. You need{" "}
              {ROUND_PASS_SCORE}% to open the next round.
            </p>
          </div>


          <div className="interview-tools">
            <button
              className={
                listening
                  ? "tool-button active-tool"
                  : "tool-button"
              }
              onClick={toggleVoice}
            >
              🎤 {listening ? "Stop & Score Voice" : "Start Voice Analysis"}
            </button>

            <button
              className="tool-button camera-button"
              onClick={toggleCamera}
            >
              📷 {cameraOpen ? "Stop Camera Analysis" : "Start Camera Analysis"}
            </button>
          </div>


          <div className="voice-card">
            <div className="answer-support-top">
              <p className="section-label">VOICE ANALYSIS</p>
              <strong>
                {listening
                  ? `${liveVoice.wpm} WPM`
                  : voiceAnalysis
                    ? voiceAnalysis.fluency_label
                    : "Not scored"}
              </strong>
            </div>

            <h3>
              {listening
                ? "Listening for fluency and accuracy..."
                : voiceAnalysis
                  ? `${voiceAnalysis.fluency_label} delivery`
                  : "Speak your answer, then stop to score"}
            </h3>

            {voiceError && (
              <p className="behavior-note warning-note">
                {voiceError}
              </p>
            )}

            {!listening && !voiceAnalysis && !voiceError && (
              <p className="behavior-note">
                A trained Random Forest / Gradient Boosting model
                scores fluency, accuracy, and accent/clarity
                (how well speech recognition understood you).
              </p>
            )}

            <Meter
              title="Accent / clarity"
              value={voiceAnalysis?.accent || 0}
              tone="good"
            />
            <Meter
              title="Fluency"
              value={voiceAnalysis?.fluency || 0}
              tone="good"
            />
            <Meter
              title="Accuracy"
              value={voiceAnalysis?.accuracy || 0}
              tone="warn"
            />

            {listening && (
              <p className="behavior-note">
                Live pace: {liveVoice.wpm} words/min · {liveVoice.wordCount} words
              </p>
            )}

            {!!voiceAnalysis?.notes?.length && (
              <ul className="behavior-flags">
                {voiceAnalysis.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>


          <div className="proctor-panel">

            {cameraOpen && (
              <div className="camera-box">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                />

                {bbox && (
                  <i
                    className="face-box"
                    style={{
                      left: `${bbox.x * 100}%`,
                      top: `${bbox.y * 100}%`,
                      width: `${bbox.w * 100}%`,
                      height: `${bbox.h * 100}%`,
                    }}
                  />
                )}

                <span className={`integrity-badge ${integrity}`}>
                  {integrityLabel(integrity)}
                </span>
              </div>
            )}


            <div className="behavior-card">
              <p className="section-label">CAMERA ANALYSIS</p>
              <h3>
                {liveAnalysis
                  ? emotionLabel(liveAnalysis.emotion)
                  : cameraOpen
                    ? "Reading expression..."
                    : "Camera is off"}
              </h3>

              {cameraError && (
                <p className="behavior-note warning-note">
                  {cameraError}
                </p>
              )}

              {serviceError && cameraOpen && (
                <p className="behavior-note warning-note">
                  {serviceError}
                </p>
              )}

              {!cameraOpen && !cameraError && (
                <p className="behavior-note">
                  Turn the camera on to estimate confidence,
                  nervousness, and malpractice risk.
                </p>
              )}

              <Meter
                title="Confidence"
                value={liveAnalysis?.confidence || 0}
                tone="good"
              />
              <Meter
                title="Nervousness"
                value={liveAnalysis?.nervousness || 0}
                tone="warn"
              />
              <Meter
                title="Cheating / malpractice risk"
                value={liveAnalysis?.cheating_risk || 0}
                tone="risk"
              />

              {!!liveAnalysis?.reasons?.length && (
                <ul className="behavior-flags">
                  {liveAnalysis.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>

          </div>


          <canvas ref={canvasRef} className="hidden-capture" />


          <div className="communication">
            {answeredInRound}/{roundQuestions.length} questions answered in this
            round.
            {voiceAnalysis ? " Voice sample captured for this question." : ""}
          </div>

          <div className="question-nav">
            <button
              type="button"
              className="nav-question"
              disabled={currentQ <= 0}
              onClick={() => showQuestionAt(currentQ - 1)}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="nav-question"
              disabled={currentQ >= roundQuestions.length - 1}
              onClick={() => showQuestionAt(currentQ + 1)}
            >
              Next →
            </button>
          </div>

          <button
            className="submit-answer"
            disabled={!canSubmitRound}
            onClick={submitRound}
          >
            Submit Round {roundNumber}
          </button>
          {!canSubmitRound ? (
            <p className="behavior-note">
              Answer all {roundQuestions.length} questions before submitting
              this round.
            </p>
          ) : null}

        </section>

      </main>

    </div>
  );
}


function Meter({ title, value, tone }) {
  return (
    <div className="behavior-meter">
      <div className="score-row-top">
        <span>{title}</span>
        <strong>{value}%</strong>
      </div>
      <div className="score-bar">
        <i
          className={`meter-fill ${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}


export default MockInterview;
