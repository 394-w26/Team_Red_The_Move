import { useEffect, useMemo, useState } from 'react'

type CampusArea = 'North' | 'South' | 'Downtown' | 'Other'
type ActivityType = 'Food' | 'Study' | 'Sports' | 'Social' | 'Other'

type Comment = {
  id: string
  author: string
  text: string
  createdAt: string
}

type Move = {
  id: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  createdAt: string
  area: CampusArea
  activityType: ActivityType
  hostId: string
  hostName: string
  attendees: string[]
  comments: Comment[]
}

type User = {
  id: string
  name: string
}

const STORAGE_KEY = 'the-move-moves'
const AREA_FILTERS: Array<'All' | CampusArea> = ['All', 'North', 'South', 'Downtown', 'Other']
const ACTIVITY_FILTERS: Array<'All' | ActivityType> = [
  'All',
  'Food',
  'Study',
  'Sports',
  'Social',
  'Other',
]
const FILTER_OPTIONS: Array<'All' | CampusArea | ActivityType> = [
  'All',
  'North',
  'South',
  'Downtown',
  'Food',
  'Study',
  'Sports',
  'Social',
  'Other',
]

const seedMoves: Move[] = [
  {
    id: 'move-1',
    title: 'Frisbee at the Lakefill',
    description: 'Sunset toss and casual hangout by the lake. Bring a water bottle.',
    location: 'Lakefill Fields',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    area: 'North',
    activityType: 'Sports',
    hostId: 'user-2',
    hostName: 'Maya',
    attendees: ['Maya'],
    comments: [
      {
        id: 'comment-1',
        author: 'Maya',
        text: 'Meet by the picnic tables facing the lake.',
        createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'move-2',
    title: 'Study Sprint at Main Library',
    description: 'Power hour in the commons with focus playlists.',
    location: 'Main Library, 2nd Floor',
    startTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    area: 'South',
    activityType: 'Study',
    hostId: 'user-1',
    hostName: 'Alec',
    attendees: ['Alec'],
    comments: [],
  },
  {
    id: 'move-3',
    title: 'Bubble Tea Run',
    description: 'Quick trip downtown for boba and a walk back.',
    location: 'Davis Street CTA',
    startTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    area: 'Downtown',
    activityType: 'Food',
    hostId: 'user-3',
    hostName: 'Zoe',
    attendees: ['Zoe', 'Alec'],
    comments: [
      {
        id: 'comment-2',
        author: 'Zoe',
        text: 'Reply if you want a specific drink!',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
    ],
  },
]

const defaultUser: User = {
  id: 'user-1',
  name: 'Alec',
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const safeParseMoves = (value: string | null) => {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Move[]
    if (Array.isArray(parsed)) return parsed
    return null
  } catch {
    return null
  }
}

const normalizeMove = (move: Move & { time?: string }): Move => {
  const startTime = move.startTime ?? move.time ?? new Date().toISOString()
  const startTimestamp = new Date(startTime).getTime()
  const endTime =
    move.endTime ??
    (Number.isNaN(startTimestamp)
      ? new Date().toISOString()
      : new Date(startTimestamp + 60 * 60 * 1000).toISOString())
  const seededActivityType =
    move.id === 'move-1'
      ? 'Sports'
      : move.id === 'move-2'
        ? 'Study'
        : move.id === 'move-3'
          ? 'Food'
          : undefined
  return {
    ...move,
    startTime,
    endTime,
    activityType: move.activityType ?? seededActivityType ?? 'Other',
  }
}

const formatTimeAgo = (isoTime: string, now: number) => {
  const timestamp = new Date(isoTime).getTime()
  if (Number.isNaN(timestamp)) return 'just now'
  const diff = Math.max(0, now - timestamp)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  return `${Math.floor(diff / day)}d ago`
}

const formatEventTime = (isoTime: string) => {
  const timestamp = new Date(isoTime)
  if (Number.isNaN(timestamp.getTime())) return isoTime
  return timestamp.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const getStatusLabel = (startTime: string, endTime: string, now: number) => {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return 'Upcoming'
  if (now < start) return 'Upcoming'
  if (now <= end) return 'Live Now'
  return 'Past'
}

const loadMoves = (): Move[] => {
  const stored = safeParseMoves(localStorage.getItem(STORAGE_KEY))
  if (stored && stored.length > 0) return stored.map(normalizeMove)
  return seedMoves
}

const sortByNewest = (moves: Move[]) =>
  [...moves].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

const App = () => {
  const [user] = useState<User>(defaultUser)
  const [moves, setMoves] = useState<Move[]>(() => loadMoves())
  const [activeTab, setActiveTab] = useState<'explore' | 'create' | 'my'>('explore')
  const [myMovesTab, setMyMovesTab] = useState<'joined' | 'hosting'>('joined')
  const [selectedFilters, setSelectedFilters] = useState<Array<CampusArea | ActivityType>>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [now, setNow] = useState(Date.now())
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    area: 'North' as CampusArea,
    activityType: 'Social' as ActivityType,
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moves))
  }, [moves])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCommentDraft('')
  }, [selectedMoveId])

  const selectedMove = useMemo(
    () => moves.find((move) => move.id === selectedMoveId) ?? null,
    [moves, selectedMoveId],
  )

  const filteredMoves = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return moves.filter((move) => {
      const matchesFilters =
        selectedFilters.length === 0 ||
        selectedFilters.some((filter) => {
          const locationTag = move.area
          if (filter === 'Other') {
            return locationTag === 'Other' || move.activityType === 'Other'
          }
          if (AREA_FILTERS.includes(filter as CampusArea)) {
            return locationTag === filter
          }
          if (ACTIVITY_FILTERS.includes(filter as ActivityType)) {
            return move.activityType === filter
          }
          return false
        })
      if (!matchesFilters) return false
      if (!query) return true
      const haystack = `${move.title} ${move.description} ${move.location}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [moves, selectedFilters, searchQuery])

  const exploreMoves = useMemo(() => {
    const statusRank = (move: Move) => {
      const status = getStatusLabel(move.startTime, move.endTime, now)
      if (status === 'Live Now') return 0
      if (status === 'Upcoming') return 1
      return 2
    }
    return [...filteredMoves].sort((a, b) => {
      const statusDelta = statusRank(a) - statusRank(b)
      if (statusDelta !== 0) return statusDelta
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [filteredMoves, now])

  const joinedMoves = useMemo(() => {
    return sortByNewest(
      moves.filter(
        (move) => move.hostId !== user.id && move.attendees.includes(user.name),
      ),
    )
  }, [moves, user.id, user.name])

  const hostingMoves = useMemo(
    () => sortByNewest(moves.filter((move) => move.hostId === user.id)),
    [moves, user.id],
  )

  const handleJoinMove = (moveId: string) => {
    setMoves((prevMoves) =>
      prevMoves.map((move) => {
        if (move.id !== moveId) return move
        if (move.attendees.includes(user.name)) return move
        return { ...move, attendees: [...move.attendees, user.name] }
      }),
    )
  }

  const handleLeaveMove = (moveId: string) => {
    setMoves((prevMoves) =>
      prevMoves.map((move) => {
        if (move.id !== moveId) return move
        return {
          ...move,
          attendees: move.attendees.filter((attendee) => attendee !== user.name),
        }
      }),
    )
  }

  const handleCancelMove = (moveId: string) => {
    setMoves((prevMoves) => prevMoves.filter((move) => move.id !== moveId))
    setSelectedMoveId((current) => (current === moveId ? null : current))
  }

  const handleCreateMove = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !formState.title ||
      !formState.description ||
      !formState.location ||
      !formState.startTime ||
      !formState.endTime ||
      !formState.activityType
    ) {
      setFormError(
        'Add a title, description, location, activity type, start time, and end time to post a move.',
      )
      return
    }
    const start = new Date(formState.startTime).getTime()
    const end = new Date(formState.endTime).getTime()
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      setFormError('End time must be after the start time.')
      return
    }
    setFormError('')
    const newMove: Move = {
      id: createId(),
      title: formState.title.trim(),
      description: formState.description.trim(),
      location: formState.location.trim(),
      startTime: new Date(formState.startTime).toISOString(),
      endTime: new Date(formState.endTime).toISOString(),
      createdAt: new Date().toISOString(),
      area: formState.area,
      activityType: formState.activityType,
      hostId: user.id,
      hostName: user.name,
      attendees: [user.name],
      comments: [],
    }
    setMoves((prevMoves) => [newMove, ...prevMoves])
    setFormState({
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      area: 'North',
      activityType: 'Social',
    })
    setActiveTab('explore')
  }

  const handleAddComment = () => {
    if (!selectedMove) return
    const trimmed = commentDraft.trim()
    if (!trimmed) return
    setMoves((prevMoves) =>
      prevMoves.map((move) => {
        if (move.id !== selectedMove.id) return move
        const nextComment: Comment = {
          id: createId(),
          author: user.name,
          text: trimmed,
          createdAt: new Date().toISOString(),
        }
        return { ...move, comments: [...move.comments, nextComment] }
      }),
    )
    setCommentDraft('')
  }

  const renderMoveCard = (move: Move) => {
    const isJoined = move.attendees.includes(user.name)
    const statusLabel = getStatusLabel(move.startTime, move.endTime, now)
    return (
      <article className="move-card" key={move.id}>
        <div
          role="button"
          tabIndex={0}
          aria-label={`Open move ${move.title}`}
          className="move-card__content"
          onClick={() => setSelectedMoveId(move.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setSelectedMoveId(move.id)
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
                  event.stopPropagation()
                  if (!isJoined) handleJoinMove(move.id)
                }}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="app-shell">
      <div className="screen">
        <header className="app-header">
          <div>
            <p className="eyebrow">Northwestern Student Hangouts</p>
            <h1>The Move</h1>
            <p className="tagline">A live feed for spontaneous campus plans.</p>
          </div>
        </header>

        {activeTab === 'explore' && (
          <section className="explore-tools">
            <label className="search">
              <span className="sr-only">Search moves</span>
              <input
                type="search"
                placeholder="Search by activity, location, or keyword"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <div className="chip-row" role="tablist" aria-label="Filters">
              {FILTER_OPTIONS.map((filter) => {
                const isAll = filter === 'All'
                const isActive = isAll
                  ? selectedFilters.length === 0
                  : selectedFilters.includes(filter as CampusArea | ActivityType)
                return (
                  <button
                    key={filter}
                    type="button"
                    className={`chip ${isActive ? 'chip--active' : ''}`}
                    onClick={() => {
                      if (isAll) {
                        setSelectedFilters([])
                        return
                      }
                      setSelectedFilters((prev) =>
                        prev.includes(filter as CampusArea | ActivityType)
                          ? prev.filter((item) => item !== filter)
                          : [...prev, filter as CampusArea | ActivityType],
                      )
                    }}
                  >
                    {filter}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <main className="app-main">
          {activeTab === 'explore' && (
            <section aria-live="polite" className="move-list">
              {exploreMoves.length === 0 ? (
                <div className="empty-state">
                  <h3>No moves yet</h3>
                  <p>Try another filter or post a new hangout.</p>
                </div>
              ) : (
                exploreMoves.map((move) => renderMoveCard(move))
              )}
            </section>
          )}

          {activeTab === 'create' && (
            <section className="create-panel">
              <div className="panel-heading">
                <h2>Create a Move</h2>
                <p>Share a quick plan and publish it instantly.</p>
              </div>
              <form className="form" onSubmit={handleCreateMove}>
                <label>
                  <span>Title</span>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Pickup soccer on Tech Lawn"
                  />
                </label>
                <label>
                  <span>Description</span>
                  <textarea
                    rows={4}
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="What&apos;s the vibe? What should people bring?"
                  />
                </label>
                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, location: event.target.value }))
                    }
                    placeholder="Tech Lawn, Norris, or downtown"
                  />
                </label>
                <div className="form-row">
                  <label>
                    <span>Start Time</span>
                    <input
                      type="datetime-local"
                      value={formState.startTime}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, startTime: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <span>End Time</span>
                    <input
                      type="datetime-local"
                      value={formState.endTime}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, endTime: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    <span>Activity Type</span>
                    <select
                      value={formState.activityType}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          activityType: event.target.value as ActivityType,
                        }))
                      }
                    >
                      {ACTIVITY_FILTERS.filter((activity) => activity !== 'All').map(
                        (activity) => (
                          <option key={activity} value={activity}>
                            {activity}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    <span>Area</span>
                    <select
                      value={formState.area}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, area: event.target.value as CampusArea }))
                      }
                    >
                      {AREA_FILTERS.filter((area) => area !== 'All').map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <button className="btn btn--primary" type="submit">
                  Post Move
                </button>
              </form>
            </section>
          )}

          {activeTab === 'my' && (
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
                              <span className="attendee-count">
                                {move.attendees.length} going
                              </span>
                              <div className="move-card__actions">
                                <button
                                  className="btn btn--ghost btn--small"
                                  type="button"
                                  onClick={() => {
                                    handleLeaveMove(move.id)
                                  }}
                                >
                                  Leave
                                </button>
                                <button
                                  className="btn btn--small"
                                  type="button"
                                  onClick={() => setSelectedMoveId(move.id)}
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
                              <span className="attendee-count">
                                {move.attendees.length} going
                              </span>
                              <div className="move-card__actions">
                                <button
                                  className="btn btn--ghost btn--small"
                                  type="button"
                                  onClick={() => handleCancelMove(move.id)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn btn--small"
                                  type="button"
                                  onClick={() => setSelectedMoveId(move.id)}
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
          )}
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        <button
          className={`nav-item ${activeTab === 'explore' ? 'nav-item--active' : ''}`}
          type="button"
          aria-label="Explore"
          onClick={() => setActiveTab('explore')}
        >
          Explore
        </button>
        <button
          className={`nav-item ${activeTab === 'create' ? 'nav-item--active' : ''}`}
          type="button"
          aria-label="Create"
          onClick={() => setActiveTab('create')}
        >
          Create
        </button>
        <button
          className={`nav-item ${activeTab === 'my' ? 'nav-item--active' : ''}`}
          type="button"
          aria-label="My Moves"
          onClick={() => setActiveTab('my')}
        >
          My Moves
        </button>
      </nav>

      {selectedMove && (
        <div className="detail-overlay" role="dialog" aria-modal="true">
          <div className="detail" data-testid="move-detail">
            <button
              className="detail__close"
              type="button"
              aria-label="Close"
              onClick={() => setSelectedMoveId(null)}
            >
              Close
            </button>
            <div className="detail__header">
              <div>
                <p className="eyebrow">{selectedMove.area} Campus</p>
                <h2>{selectedMove.title}</h2>
                <p className="detail__subtitle">Hosted by {selectedMove.hostName}</p>
              </div>
              <div className="detail__status">
                <span
                  className={`status-badge ${
                    getStatusLabel(selectedMove.startTime, selectedMove.endTime, now) === 'Past'
                      ? 'status-badge--past'
                      : ''
                  }`}
                >
                  {getStatusLabel(selectedMove.startTime, selectedMove.endTime, now)}
                </span>
                <span className="detail__time">
                  {formatTimeAgo(selectedMove.createdAt, now)}
                </span>
              </div>
            </div>
            <p className="detail__description">{selectedMove.description}</p>
            <div className="detail__meta">
              <div>
                <strong>Location</strong>
                <span>{selectedMove.location}</span>
              </div>
              <div>
                <strong>Time</strong>
                <span>
                  {formatEventTime(selectedMove.startTime)} -{' '}
                  {formatEventTime(selectedMove.endTime)}
                </span>
              </div>
              <div>
                <strong>Activity</strong>
                <span>{selectedMove.activityType}</span>
              </div>
            </div>
            <div className="detail__actions">
              <span className="attendee-count" data-testid="attendee-count">
                {selectedMove.attendees.length} going
              </span>
              <div className="detail__buttons">
                <button
                  className={`btn ${
                    selectedMove.attendees.includes(user.name) ? 'btn--ghost' : 'btn--primary'
                  }`}
                  type="button"
                  aria-label={`${
                    selectedMove.attendees.includes(user.name) ? 'Joined' : 'Join'
                  } ${selectedMove.title}`}
                  onClick={() => handleJoinMove(selectedMove.id)}
                >
                  {selectedMove.attendees.includes(user.name) ? 'Joined' : 'Join'}
                </button>
                {selectedMove.attendees.includes(user.name) &&
                  selectedMove.hostId !== user.id && (
                    <button
                      className="btn btn--ghost"
                      type="button"
                      onClick={() => handleLeaveMove(selectedMove.id)}
                    >
                      Leave
                    </button>
                  )}
                {selectedMove.hostId === user.id && (
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() => handleCancelMove(selectedMove.id)}
                  >
                    Cancel Move
                  </button>
                )}
              </div>
            </div>

            <div className="detail__attendees">
              <h3>Attendees</h3>
              {selectedMove.attendees.includes(user.name) ? (
                <ul>
                  {selectedMove.attendees.map((attendee) => (
                    <li key={attendee}>{attendee}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Join to see the attendee list.</p>
              )}
            </div>

            <div className="detail__comments">
              <h3>Comments</h3>
              <div className="comments">
                {selectedMove.comments.length === 0 ? (
                  <p className="muted">No comments yet. Start the plan.</p>
                ) : (
                  selectedMove.comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment__header">
                        <strong>{comment.author}</strong>
                        <span>{formatTimeAgo(comment.createdAt, now)}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="comment-form">
                <label>
                  <span className="sr-only">Add a comment</span>
                  <input
                    type="text"
                    placeholder="Coordinate details here"
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                  />
                </label>
                <button className="btn btn--primary" type="button" onClick={handleAddComment}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
