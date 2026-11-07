import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = { title: string; reason: string };
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function loadWorkoutSuggestions() {
      setState({ status: 'loading' });
      try {
        const response = await getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);
        if (!Array.isArray(response.suggestions)) {
          throw new Error('Invalid suggestions response');
        }
        if (active) setState({ status: 'loaded', suggestions: response.suggestions });
      } catch (error) {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    void loadWorkoutSuggestions();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {state.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
        {state.status === 'error' && (
          <p role="alert">Unable to load workout suggestions: {state.message}</p>
        )}
        {state.status === 'loaded' && state.suggestions.length === 0 && (
          <p>No workout suggestions available.</p>
        )}
        {state.status === 'loaded' && state.suggestions.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.suggestions.map((suggestion, index) => (
              <li className="list-group-item" key={index}>
                {suggestion.title}: {suggestion.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
