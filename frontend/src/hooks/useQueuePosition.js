import { useState, useEffect, useRef } from 'react';

export const useQueuePosition = (providerId) => {
  const [state, setState] = useState({
    position: null,
    total: null,
    eligible: false,
    estimatedWaitMins: null,
    error: null,
    connected: false,
  });

  const esRef = useRef(null);

  useEffect(() => {
    if (!providerId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const url = `/api/queue/stream/${providerId}?token=${token}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setState(s => ({ ...s, connected: true, error: null }));

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setState({
          position: data.position,
          total: data.total,
          eligible: data.eligible,
          estimatedWaitMins: data.estimatedWaitMins,
          error: data.error ? 'Queue engine unavailable' : null,
          connected: true,
        });
      } catch {
        setState(s => ({ ...s, error: 'Failed to parse queue data' }));
      }
    };

    es.onerror = () => {
      setState(s => ({ ...s, connected: false, error: 'Connection lost — retrying...' }));
    };

    return () => {
      es.close();
    };
  }, [providerId]);

  return state;
};
