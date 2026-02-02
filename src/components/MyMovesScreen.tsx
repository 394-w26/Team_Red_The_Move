import { useState } from 'react';
import type { Move } from '../types';
import { formatDateRangeWithRelative, getStatusLabel } from '../utilities/helpers';
import { useSavedMoves } from '../contexts/SavedMovesContext';
import { CalendarClock, MapPin, Star, UserRound } from 'lucide-react';
import { activityIcons } from './activityIcons';

type MyMovesScreenProps = {
  allMoves: Move[];
  joinedMoves: Move[];
  hostingMoves: Move[];
  now: number;
  userName: string;
  onCancelMove: (moveId: string) => void;
  onJoinMove: (moveId: string) => void;
  onLeaveMove: (moveId: string) => void;
  onSelectMove: (moveId: string) => void;
  onEditMove?: (moveId: string) => void;
};

export const MyMovesScreen = ({
  allMoves,
  joinedMoves,
  hostingMoves,
  now,
  userName,
  onCancelMove,
  onJoinMove,
  onLeaveMove,
  onSelectMove,
  onEditMove,
}: MyMovesScreenProps) => {
  const [myMovesTab, setMyMovesTab] = useState<'joined' | 'hosting' | 'saved'>('joined');
  const { unsaveMove, isSaved } = useSavedMoves();

  // Filter all moves to get only saved ones from the full collection
  const savedMoves = allMoves.filter((move) => {
    if (!isSaved(move.id)) return false;
    return new Date(move.endTime).getTime() >= now;
  });

  return (
    <section className="my-moves">
      <nav className="my-moves-tabs" role="tablist" aria-label="My Moves">
        <button
          type="button"
          role="tab"
          aria-selected={myMovesTab === 'joined'}
          className={`my-moves-tab ${myMovesTab === 'joined' ? 'my-moves-tab--active' : ''}`}
          onClick={() => setMyMovesTab('joined')}
        >
          Joined
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={myMovesTab === 'hosting'}
          className={`my-moves-tab ${myMovesTab === 'hosting' ? 'my-moves-tab--active' : ''}`}
          onClick={() => setMyMovesTab('hosting')}
        >
          Hosting
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={myMovesTab === 'saved'}
          className={`my-moves-tab ${myMovesTab === 'saved' ? 'my-moves-tab--active' : ''}`}
          onClick={() => setMyMovesTab('saved')}
        >
          Saved
        </button>
      </nav>
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
                  <div
                    className="move-card__content move-card__content--clickable"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${move.title}`}
                    onClick={() => onSelectMove(move.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectMove(move.id);
                      }
                    }}
                  >
                    <div className="move-card__header move-card__header--single-row">
                      <div>
                        <h3>{move.title}</h3>
                      </div>
                      <div className="move-card__status">
                        <div className="move-card__status-row">
                          <span className="move-card__badge">{activityIcons[move.activityType]}</span>
                          <span
                            className={`status-badge ${getStatusLabel(move.startTime, move.endTime, now) === 'Past'
                              ? 'status-badge--past'
                              : ''
                              }`}
                          >
                            <span
                              className={`status-dot status-dot--${getStatusLabel(move.startTime, move.endTime, now)
                                .toLowerCase()
                                .replace(' ', '-')}`}
                              aria-hidden="true"
                            />
                            {getStatusLabel(move.startTime, move.endTime, now)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="move-card__meta-stack">
                      <div className="move-card__meta-row">
                        <CalendarClock size={14} className="move-card__meta-icon" />
                        <span>{formatDateRangeWithRelative(move.startTime, move.endTime, now)}</span>
                      </div>
                      <div className="move-card__meta-row">
                        <MapPin size={14} className="move-card__meta-icon" />
                        <span>{(move.locationName || move.location).split(',')[0]}</span>
                      </div>
                      <div className="move-card__meta-row">
                        <UserRound size={14} className="move-card__meta-icon" />
                        <span>Hosted by {move.hostName}</span>
                      </div>
                    </div>
                    <div className="move-card__footer">
                      <span className="attendee-count attendee-count--with-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                          <circle cx="12" cy="7" r="4" fill="currentColor" />
                          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
                        </svg>
                        {move.attendees.length}/{move.maxParticipants}
                      </span>
                      <div className="move-card__actions">
                        <button
                          className="btn btn--small btn--ghost"
                          type="button"
                          aria-label={`Leave ${move.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLeaveMove(move.id);
                          }}
                        >
                          Leave
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
                  <div
                    className="move-card__content move-card__content--clickable"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${move.title}`}
                    onClick={() => onSelectMove(move.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectMove(move.id);
                      }
                    }}
                  >
                    <div className="move-card__header move-card__header--single-row">
                      <div>
                        <h3>{move.title}</h3>
                      </div>
                      <div className="move-card__status">
                        <div className="move-card__status-row">
                          <span className="move-card__badge">{activityIcons[move.activityType]}</span>
                          <span
                            className={`status-badge ${getStatusLabel(move.startTime, move.endTime, now) === 'Past'
                              ? 'status-badge--past'
                              : ''
                              }`}
                          >
                            <span
                              className={`status-dot status-dot--${getStatusLabel(move.startTime, move.endTime, now)
                                .toLowerCase()
                                .replace(' ', '-')}`}
                              aria-hidden="true"
                            />
                            {getStatusLabel(move.startTime, move.endTime, now)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="move-card__meta-stack">
                      <div className="move-card__meta-row">
                        <CalendarClock size={14} className="move-card__meta-icon" />
                        <span>{formatDateRangeWithRelative(move.startTime, move.endTime, now)}</span>
                      </div>
                      <div className="move-card__meta-row">
                        <MapPin size={14} className="move-card__meta-icon" />
                        <span>{(move.locationName || move.location).split(',')[0]}</span>
                      </div>
                      <div className="move-card__meta-row">
                        <UserRound size={14} className="move-card__meta-icon" />
                        <span>You&apos;re hosting</span>
                      </div>
                    </div>
                    <div className="move-card__footer">
                      <span className="attendee-count attendee-count--with-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                          <circle cx="12" cy="7" r="4" fill="currentColor" />
                          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
                        </svg>
                        {move.attendees.length}/{move.maxParticipants}
                      </span>
                      <div className="move-card__actions">
                        <button
                          className="btn btn--ghost btn--small"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMove?.(move.id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn--ghost btn--small"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelMove(move.id);
                          }}
                          aria-label="Cancel move"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </>
        )}
        {myMovesTab === 'saved' && (
          <>
            {savedMoves.length === 0 ? (
              <div className="empty-state">
                <h3>No saved moves</h3>
                <p>Save moves from Explore to see them here.</p>
              </div>
            ) : (
              savedMoves.map((move) => (
                <article key={move.id} className="move-card move-card--compact">
                  <div
                    className="move-card__content move-card__content--clickable"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${move.title}`}
                    onClick={() => onSelectMove(move.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectMove(move.id);
                      }
                    }}
                  >
                    <div className="move-card__header move-card__header--single-row">
                      <div>
                        <h3>{move.title}</h3>
                      </div>
                      <div className="move-card__status">
                        <div className="move-card__status-row">
                          <span className="move-card__badge">{activityIcons[move.activityType]}</span>
                          <span
                            className={`status-badge ${getStatusLabel(move.startTime, move.endTime, now) === 'Past'
                              ? 'status-badge--past'
                              : ''
                              }`}
                          >
                            <span
                              className={`status-dot status-dot--${getStatusLabel(move.startTime, move.endTime, now)
                                .toLowerCase()
                                .replace(' ', '-')}`}
                              aria-hidden="true"
                            />
                            {getStatusLabel(move.startTime, move.endTime, now)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="move-card__meta-stack">
                      <div className="move-card__meta-row">
                        <CalendarClock size={14} className="move-card__meta-icon" />
                        <span>{formatDateRangeWithRelative(move.startTime, move.endTime, now)}</span>
                      </div>
                      <div className="move-card__meta-row">
                        <MapPin size={14} className="move-card__meta-icon" />
                        <span>{(move.locationName || move.location).split(',')[0]}</span>
                      </div>
                      <div className="move-card__meta-row">
                        <UserRound size={14} className="move-card__meta-icon" />
                        <span>Hosted by {move.hostName}</span>
                      </div>
                    </div>
                    <div className="move-card__footer">
                      <span className="attendee-count attendee-count--with-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                          <circle cx="12" cy="7" r="4" fill="currentColor" />
                          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
                        </svg>
                        {move.attendees.length}/{move.maxParticipants}
                      </span>
                      <div className="move-card__actions">
                        <button
                          className="save-toggle-btn"
                          type="button"
                          aria-label={`Unsave ${move.title}`}
                          aria-pressed="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            void unsaveMove(move.id);
                          }}
                          title="Remove from saved"
                        >
                          <Star
                            size={16}
                            strokeWidth={2}
                            fill="currentColor"
                          />
                        </button>
                        {move.attendees.includes(userName) ? (
                          <button
                            className="btn btn--small btn--ghost"
                            type="button"
                            aria-label={`Leave ${move.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onLeaveMove(move.id);
                            }}
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            className="btn btn--small btn--primary"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJoinMove(move.id);
                            }}
                          >
                            Join
                          </button>
                        )}
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
