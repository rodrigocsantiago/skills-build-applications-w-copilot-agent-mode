import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; activities: Activity[] };

export default function Activities() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setState({ status: 'loading' });
      try {
        const response = await getJson<{ activities: Activity[] }>('/api/activities');
        if (!Array.isArray(response.activities)) {
          throw new Error('Invalid activities response');
        }
        if (active) setState({ status: 'loaded', activities: response.activities });
      } catch (error) {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    void loadActivities();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {state.status === 'loading' && <p role="status">Loading activities...</p>}
        {state.status === 'error' && (
          <p role="alert">Unable to load activities: {state.message}</p>
        )}
        {state.status === 'loaded' && state.activities.length === 0 && (
          <p>No activities yet.</p>
        )}
        {state.status === 'loaded' && state.activities.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.activities.map((activity, index) => (
              <li className="list-group-item" key={index}>
                {activity.type}: {activity.minutes} minutes, {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
