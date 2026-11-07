import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; members: unknown[] };
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; teams: Team[] };

export default function Teams() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function loadTeams() {
      setState({ status: 'loading' });
      try {
        const response = await getJson<{ teams: Team[] }>('/api/teams');
        if (!Array.isArray(response.teams)) {
          throw new Error('Invalid teams response');
        }
        if (active) setState({ status: 'loaded', teams: response.teams });
      } catch (error) {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    void loadTeams();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {state.status === 'loading' && <p role="status">Loading teams...</p>}
        {state.status === 'error' && (
          <p role="alert">Unable to load teams: {state.message}</p>
        )}
        {state.status === 'loaded' && state.teams.length === 0 && <p>No teams yet.</p>}
        {state.status === 'loaded' && state.teams.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.teams.map((team, index) => (
              <li className="list-group-item" key={index}>
                {team.name}: {Array.isArray(team.members) ? team.members.length : 0} members
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
