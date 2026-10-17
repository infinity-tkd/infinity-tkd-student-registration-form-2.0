import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearDraft,
  hasDraftData,
  readDraft,
  writeDraft,
} from "../utils/drafts";

export function useRegistrationDraft({
  defaults,
  data,
  step,
  lang,
  scheduleGroup,
  classTime,
  submissionUncertain,
}) {
  const [recovery, setRecovery] = useState(() => readDraft(defaults));
  const [status, setStatus] = useState("idle");
  const paused = useRef(!!recovery);
  const ignoredData = useRef(null);
  const snapshot = useMemo(
    () => ({ data, step, lang, scheduleGroup, classTime, submissionUncertain }),
    [data, step, lang, scheduleGroup, classTime, submissionUncertain],
  );
  const latest = useRef(snapshot);
  useLayoutEffect(() => {
    latest.current = snapshot;
  }, [snapshot]);
  const flush = useCallback(
    (override = {}) => {
      if (paused.current || latest.current.data === ignoredData.current)
        return true;
      return writeDraft({ ...latest.current, ...override }, defaults);
    },
    [defaults],
  );
  useEffect(() => {
    if (paused.current || data === ignoredData.current) return;
    const timer = setTimeout(() => {
      const ok = flush();
      setStatus(
        !ok ? "unavailable" : hasDraftData(data, defaults) ? "saved" : "idle",
      );
    }, 200);
    return () => clearTimeout(timer);
  }, [snapshot, data, defaults, flush]);
  useEffect(() => {
    const save = () => {
      flush();
    };
    const hide = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    window.addEventListener("infinity:save-draft", save);
    document.addEventListener("visibilitychange", hide);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      window.removeEventListener("infinity:save-draft", save);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [flush]);
  const discard = useCallback(() => {
    ignoredData.current = latest.current.data;
    paused.current = false;
    const ok = clearDraft();
    setRecovery(null);
    setStatus(ok ? "idle" : "unavailable");
    return ok;
  }, []);
  const resume = useCallback(() => {
    paused.current = false;
    setRecovery(null);
  }, []);
  return { recovery, status, flush, discard, resume };
}
