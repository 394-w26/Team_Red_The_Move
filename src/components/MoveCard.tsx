import type { Move } from '../types';
import { formatTimeAgo, formatEventTime, getStatusLabel } from '../utilities/helpers';

type MoveCardProps = {
  move: Move;
  now: number;
  userName: string;
  onJoinMove: (moveId: string) => void;
  onSelectMove: (moveId: string) => void;
};

export const MoveCard = ({ move, now, userName, onJoinMove, onSelectMove }: MoveCardProps) => {
  const isJoined = move.attendees.includes(userName);
  const statusLabel = getStatusLabel(move.startTime, move.endTime, now);
  
  return (
    <article className="move-card">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open move ${move.title}`}
        className="move-card__content"
        onClick={() => onSelectMove(move.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectMove(move.id);
          }
        }}
      >
        <div className="move-card__header">
          <div>
            <h3>{move.title}</h3>
            <p className="move-card__subtitle">Hosted by {move.hostName}</p>
          </div>
          <div className="move-card__status">
            <span
              className={`status-badge ${statusLabel === 'Past' ? 'status-badge--past' : ''}`}
            >
              {statusLabel}
            </span>
            <span className="move-card__time">{formatTimeAgo(move.createdAt, now)}</span>
          </div>
        </div>
        <p className="move-card__description">{move.description}</p>
        <div className="move-card__meta">
          <span>{move.location}</span>
          <span>
            {formatEventTime(move.startTime)} - {formatEventTime(move.endTime)}
          </span>
          <span>{move.activityType}</span>
        </div>
        <div className="move-card__footer">
          <div className="move-card__tags">
            <span className="chip chip--soft">{move.area}</span>
            <span className="chip chip--soft">{move.activityType}</span>
          </div>
          <div className="move-card__actions">
            <span className="attendee-count">{move.attendees.length} going</span>
            <button
              className={`btn btn--small ${isJoined ? 'btn--ghost' : 'btn--primary'}`}
              type="button"
              aria-label={`${isJoined ? 'Joined' : 'Join'} ${move.title}`}
              onClick={(event) => {
                event.stopPropagation();
                if (!isJoined) onJoinMove(move.id);
              }}
            >
              {isJoined ? 'Joined' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
