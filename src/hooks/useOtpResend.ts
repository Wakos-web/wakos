import { useCallback, useRef, useState } from "react";

const COOLDOWN_SECONDS = 30;
const MAX_SENDS = 5;

/**
 * Guards OTP "send code" buttons so users can resend, but not spam:
 * - a 30s cooldown after every successful send, and
 * - at most 5 sends per session (Supabase additionally rate-limits server-side).
 *
 * Usage:
 *   const resend = useOtpResend();
 *   // before sending:
 *   if (!resend.allowSend()) { setError(resend.hint()); return; }
 *   // after a successful send:
 *   resend.onSent();
 */
export function useOtpResend() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sendsLeft, setSendsLeft] = useState(MAX_SENDS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setSecondsLeft(COOLDOWN_SECONDS);
    timer.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const allowSend = useCallback(() => {
    if (secondsLeft > 0) return false;
    if (sendsLeft <= 0) return false;
    return true;
  }, [secondsLeft, sendsLeft]);

  const hint = useCallback(() => {
    if (sendsLeft <= 0) return "You have reached the resend limit for this session. Please try again later.";
    if (secondsLeft > 0) return `Please wait ${secondsLeft}s before sending another code.`;
    return "";
  }, [secondsLeft, sendsLeft]);

  const onSent = useCallback(() => {
    setSendsLeft((n) => Math.max(0, n - 1));
    startCooldown();
  }, [startCooldown]);

  const label = useCallback(() => {
    if (secondsLeft > 0) return `Resend code in ${secondsLeft}s`;
    if (sendsLeft <= 0) return "Resend limit reached";
    return "Resend code";
  }, [secondsLeft, sendsLeft]);

  return { secondsLeft, sendsLeft, maxSends: MAX_SENDS, allowSend, hint, onSent, label };
}