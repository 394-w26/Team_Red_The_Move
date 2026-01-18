import { useState } from 'react';
import type { Move } from '../types';
import { formatTimeAgo, formatEventTime, getStatusLabel } from '../utilities/helpers';

type MyMovesScreenProps = {
  joinedMoves: Move[];
  hostingMoves: Move[];
  now: number;
  onLeaveMove: (moveId: string) => void;
  onCancelMove: (moveId: string) => void;
  onSelectMove: (moveId: string) => void;
};

export const MyMovesScreen = ({
  joinedMoves,
  hostingMoves,
  now,
  onLeaveMove,
  onCancelMove,
  onSelectMove,
}: MyMovesScreenProps) => {
  const [myMovesTab, setMyMovesTab] = useState<'joined' | 'hosting'>('joined');

  return (
    <section className="my-moves">
      <div className="sub-tabs" role="tablist" aria-label="My Moves">
        <button
          type="button"
          className={`sub-tab ${myMovesTab === 'joined' ? 'sub-tab--active' : ''}`}
          onClick={() => setMyMovesTab('joined')}
        >
          Joined
        </button>
        <button
          type="button"
          className={`sub-tab ${myMovesTab === 'hosting' ? 'sub-tab--active' : ''}`}
          onClick={() => setMyMovesTab('hosting')}
        >
          Hosting
        </button>
      </div>
      <div className="move-list">
        {myMovesTab === 'joined' && (
          <>
            {joinedMoves.length === 0 ? (
              <div className="empty-state">
                <h3>No joined moves</h3>
                <p>Jump into a move from Explore to see it here.</p>
              </div>
            ) : (
              joinedMoves.map((move) => (
                <article key={move.id} className="move-card move-card--compact">
                  <div className="move-card__content">
                    <div className="move-card__header">
                      <div>
                        <h3>{move.title}</h3>
                        <p className="move-card__subtitle">Hosted by {move.hostName}</p>
                      </div>
                      <div className="move-card__status">
                        <span
                          className={`status-badge ${
                            getStatusLabel(move.startTime, move.endTime, now) === 'Past'
                              ? 'status-badge--past'
                              : ''
                          }`}
                        >
                          {getStatusLabel(move.startTime, move.endTime, now)}
                        </span>
                        <span className="move-card__time">
                          {formatTimeAgo(move.createdAt, now)}
                        </span>
                      </div>
                    </div>
                    <div className="move-card__meta">
                      <span>{move.location}</span>
                      <span>
                        {formatEventTime(move.startTime)} - {formatEventTime(move.endTime)}
                      </span>
                      <span>{move.activityType}</span>
                    </div>
                    <div className="move-card__footer">
                      <span className="attendee-count">{move.attendees.length} going</span>
                      <div className="move-card__actions">
                        <button
                          className="btn btn--ghost btn--small"
                          type="button"
                          onClick={() => onLeaveMove(move.id)}
                        >
                          Leave
                        </button>
                        <button
                          className="btn btn--small"
                          type="button"
                          onClick={() => onSelectMove(move.id)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </>
        )}
        {myMovesTab === 'hosting' && (
          <>
            {hostingMoves.length === 0 ? (
              <div className="empty-state">
                <h3>No hosting moves</h3>
                <p>Create a move to rally people nearby.</p>
              </div>
            ) : (
              hostingMoves.map((move) => (
                <article key={move.id} className="move-card move-card--compact">
                  <div className="move-card__content">
                    <div className="move-card__header">
                      <div>
                        <h3>{move.title}</h3>
                        <p className="move-card__subtitle">You&apos;re hosting</p>
                      </div>
                      <div className="move-card__status">
                        <span
                          className={`status-badge ${
                            getStatusLabel(move.startTime, move.endTime, now) === 'Past'
                              ? 'status-badge--past'
                              : ''
                          }`}
                        >
                          {getStatusLabel(move.startTime, move.endTime, now)}
                        </span>
                        <span className="move-card__time">
                          {formatTimeAgo(move.createdAt, now)}
                        </span>
                      </div>
                    </div>
                    <div className="move-card__meta">
                      <span>{move.location}</span>
                      <span>
                        {formatEventTime(move.startTime)} - {formatEventTime(move.endTime)}
                      </span>
                    </div>
                    <div className="move-card__footer">
                      <span className="attendee-count">{move.attendees.length} going</span>
                      <div className="move-card__actions">
                        <button
                          className="btn btn--ghost btn--small"
                          type="button"
                          onClick={() => onCancelMove(move.id)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn--small"
                          type="button"
                          onClick={() => onSelectMove(move.id)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </>
        )}
      </div>
    </section>
  );
};
