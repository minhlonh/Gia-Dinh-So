'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, RotateCcw, Send, Square, X } from 'lucide-react';
import { useFamily } from '@/context/FamilyContext';
import { LANGS } from '@/lib/i18n';

export interface VoiceResult {
  audioUrl: string;
  transcript: string;
  durationSec: number;
}

interface VoiceRecordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (result: VoiceResult) => void | Promise<void>;
}

type Status = 'idle' | 'recording' | 'recorded' | 'error';

interface SpeechAlternativeLike {
  transcript: string;
}
interface SpeechResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechAlternativeLike;
}
interface SpeechEventLike {
  results: { length: number; [index: number]: SpeechResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
interface SpeechWindow {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

const formatClock = (total: number) => {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function VoiceRecordModal({ open, onClose, onSubmit }: VoiceRecordModalProps) {
  const { t, lang, activeMember } = useFamily();

  const [status, setStatus] = useState<Status>('idle');
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const durationRef = useRef(0);

  const senior = activeMember?.role === 'grandparent';

  const releaseHardware = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      /* recognition already stopped */
    }
    recognitionRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const resetAll = useCallback(() => {
    releaseHardware();
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSeconds(0);
    setTranscript('');
    setErrorKey(null);
    setStatus('idle');
  }, [releaseHardware]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetAll();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open, resetAll, onClose]);

  useEffect(() => releaseHardware, [releaseHardware]);

  const startRecognition = () => {
    const w = window as unknown as SpeechWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    try {
      const recognition = new Ctor();
      const speechLang = LANGS.find((l) => l.code === lang)?.speech ?? 'vi-VN';
      recognition.lang = speechLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i += 1) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text.trim());
      };
      recognition.onerror = () => undefined;
      recognition.onend = () => undefined;
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      recognitionRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorKey(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setErrorKey('Trình duyệt không hỗ trợ thu âm.');
      setStatus('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        setStatus('recorded');
      };
      recorderRef.current = recorder;
      recorder.start();

      startedAtRef.current = Date.now();
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);

      startRecognition();
      setStatus('recording');
    } catch {
      releaseHardware();
      setErrorKey('Chưa cấp quyền micro.');
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    durationRef.current = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    setSeconds(durationRef.current);
    try {
      recognitionRef.current?.stop();
    } catch {
      /* recognition already stopped */
    }
    recognitionRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleSubmit = async () => {
    if (!audioUrl || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        audioUrl,
        transcript: transcript.trim(),
        durationSec: durationRef.current,
      });
      setAudioUrl(null);
      resetAll();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const micSize = senior ? 'h-28 w-28' : 'h-20 w-20';
  const statusText =
    status === 'recording'
      ? 'Đang thu âm...'
      : status === 'recorded'
        ? 'Đã ghi âm xong'
        : 'Bấm micro để bắt đầu';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Thu âm giọng nói"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className={
              senior
                ? 'w-full max-w-xl rounded-3xl border-4 border-amber-900 bg-amber-50 p-8 text-stone-900'
                : 'w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-2xl'
            }
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className={senior ? 'text-3xl font-extrabold' : 'text-xl font-bold'}>
                Ghi âm câu chuyện
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Đóng"
                className={
                  senior
                    ? 'grid h-14 w-14 place-items-center rounded-2xl border-4 border-amber-900'
                    : 'grid h-10 w-10 place-items-center rounded-full hover:bg-black/5'
                }
              >
                <X className={senior ? 'h-8 w-8' : 'h-5 w-5'} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 text-center">
              <div className="relative">
                {status === 'recording' && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-red-400/50"
                    animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                    transition={{ repeat: Infinity, duration: 1.3 }}
                    aria-hidden="true"
                  />
                )}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  disabled={status === 'recorded'}
                  onClick={status === 'recording' ? stopRecording : startRecording}
                  aria-label={status === 'recording' ? 'Dừng thu âm' : 'Bắt đầu thu âm'}
                  className={[
                    'relative grid place-items-center rounded-full text-white disabled:opacity-40',
                    micSize,
                    status === 'recording'
                      ? 'bg-red-600'
                      : senior
                        ? 'border-4 border-amber-900 bg-orange-600'
                        : 'bg-indigo-600',
                  ].join(' ')}
                >
                  {status === 'recording' ? (
                    <Square className={senior ? 'h-12 w-12' : 'h-8 w-8'} aria-hidden="true" />
                  ) : (
                    <Mic className={senior ? 'h-14 w-14' : 'h-9 w-9'} aria-hidden="true" />
                  )}
                </motion.button>
              </div>

              <p className="font-mono text-3xl font-bold tabular-nums" aria-live="polite">
                {formatClock(seconds)}
              </p>
              <p className={senior ? 'text-xl font-semibold' : 'text-sm'} aria-live="polite">
                {statusText}
              </p>

              {status === 'error' && errorKey && (
                <div role="alert" className="space-y-3">
                  <p className={senior ? 'text-xl font-semibold text-red-900' : 'text-sm text-red-700'}>
                    {errorKey}
                  </p>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 font-medium hover:bg-slate-300"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Thử lại
                  </button>
                </div>
              )}
            </div>

            {status === 'recorded' && audioUrl && (
              <div className="mt-6 space-y-4">
                <audio controls src={audioUrl} className="w-full" />
                <div>
                  <label
                    htmlFor="voice-transcript"
                    className={senior ? 'mb-2 block text-lg font-bold' : 'mb-1 block text-sm font-medium'}
                  >
                    Văn bản nhận diện:
                  </label>
                  <textarea
                    id="voice-transcript"
                    rows={3}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder="Chưa ghi nhận văn bản..."
                    className={
                      senior
                        ? 'w-full rounded-2xl border-4 border-amber-900 bg-white p-4 text-xl'
                        : 'w-full rounded-lg border border-slate-300 bg-white p-3 text-sm'
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                    Gửi
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={resetAll}
                    className="flex items-center gap-2 rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-800 hover:bg-slate-300 disabled:opacity-50"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Thu lại
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
