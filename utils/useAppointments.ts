import { useCallback, useEffect, useState } from "react";
import { apiGet } from "./api";

export default function useAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const POLL_INTERVAL = 15000; // 15s

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet("/api/appointments");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Unable to load appointments");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(
          data.map((item: any) => ({
            ...item,
            date: item.date ? new Date(item.date).toISOString() : null,
          })),
        );
      } else {
        setAppointments([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    const id = setInterval(() => {
      fetchAppointments();
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAppointments]);

  return { appointments, loading, error, refresh: fetchAppointments };
}
