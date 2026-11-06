import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; rankings: Ranking[] };

export default function Leaderboard() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      setState({ status: 'loading' });
      try {
        const response = await getJson<{ leaderboard: Ranking[] }>('/api/leaderboard');
        if (!Array.isArray(response.leaderboard)) {
          throw new Error('Invalid leaderboard response');
        }
        if (active) setState({ status: 'loaded', rankings: response.leaderboard });
      } catch (error) {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    void loadLeaderboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {state.status === 'loading' && <p role="status">Loading leaderboard...</p>}
        {state.status === 'error' && (
          <p role="alert">Unable to load leaderboard: {state.message}</p>
        )}
        {state.status === 'loaded' && state.rankings.length === 0 && (
          <p>No leaderboard rankings yet.</p>
        )}
        {state.status === 'loaded' && state.rankings.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.rankings.map((ranking, index) => (
              <li className="list-group-item" key={index}>
                #{ranking.rank} {ranking.teamName}: {ranking.totalPoints} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
