import { useState, useEffect, useCallback, useRef } from "react";
import { getBookingTime } from "../services/userService";

const calculateWaitingMinutes = (maxWaitingTimeValue) => {
  if (maxWaitingTimeValue === null || maxWaitingTimeValue === undefined)
    return null;

  try {
    if (typeof maxWaitingTimeValue === "number") return maxWaitingTimeValue;

    // If backend returns numeric string
    if (typeof maxWaitingTimeValue === "string") {
      const numeric = Number(maxWaitingTimeValue);
      if (!Number.isNaN(numeric) && maxWaitingTimeValue.trim() !== "")
        return numeric;

      const endTime = new Date(maxWaitingTimeValue);
      if (isNaN(endTime.getTime())) return null;
      const diffMs = endTime - new Date();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? diffMinutes : 0;
    }

    return null;
  } catch (e) {
    return null;
  }
};

export default function useBookingTime(userId) {
  const [raw, setRaw] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBookingTime(userId);
      if (!mounted.current) return;
      setRaw(res);
      setMinutes(calculateWaitingMinutes(res));
    } catch (err) {
      if (!mounted.current) return;
      setError(err);
    } finally {
      if (!mounted.current) return;
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    fetch();
    return () => {
      mounted.current = false;
    };
  }, [fetch]);

  const refresh = () => fetch();

  return { raw, minutes, loading, error, refresh };
}
