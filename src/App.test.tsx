import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('Join button increments count and reveals attendees', () => {
  render(<App />)

  const openButton = screen.getByRole('button', {
    name: /open move frisbee at the lakefill/i,
  })
  fireEvent.click(openButton)

  const detail = screen.getByTestId('move-detail')
  expect(within(detail).getByText(/join to see the attendee list/i)).toBeInTheDocument()
  expect(within(detail).getByTestId('attendee-count')).toHaveTextContent('1 going')

  const joinButton = within(detail).getByRole('button', {
    name: /join frisbee at the lakefill/i,
  })
  fireEvent.click(joinButton)

  expect(within(detail).getByTestId('attendee-count')).toHaveTextContent('2 going')
  expect(within(detail).queryByText(/join to see the attendee list/i)).not.toBeInTheDocument()
  expect(within(detail).getByText('Alec')).toBeInTheDocument()
})

test('North Campus filter hides South Campus moves', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'North' }))
  expect(screen.queryByText(/study sprint at main library/i)).not.toBeInTheDocument()
})

test('My Moves tabs separate Joined moves and Hosting moves', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: /my moves/i }))
  expect(screen.getByText(/bubble tea run/i)).toBeInTheDocument()
  expect(screen.queryByText(/study sprint at main library/i)).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /hosting/i }))
  expect(screen.getByText(/study sprint at main library/i)).toBeInTheDocument()
  expect(screen.queryByText(/bubble tea run/i)).not.toBeInTheDocument()
})

test('moves show Upcoming before start, Live Now during, and Past after end', () => {
  const now = Date.now()
  const moves = [
    {
      id: 'past-move',
      title: 'Late Night Snacks',
      description: 'Runs to the vending machines.',
      location: 'Elder Hall',
      startTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now - 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      area: 'North',
      activityType: 'Food',
      hostId: 'user-2',
      hostName: 'Maya',
      attendees: ['Maya'],
      comments: [],
    },
    {
      id: 'live-move',
      title: 'Courtyard Hang',
      description: 'Chill chat between classes.',
      location: 'Kresge Hall',
      startTime: new Date(now - 30 * 60 * 1000).toISOString(),
      endTime: new Date(now + 30 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      area: 'South',
      activityType: 'Social',
      hostId: 'user-3',
      hostName: 'Zoe',
      attendees: ['Zoe'],
      comments: [],
    },
    {
      id: 'future-move',
      title: 'Morning Walk',
      description: 'Quick loop around campus.',
      location: 'The Arch',
      startTime: new Date(now + 60 * 60 * 1000).toISOString(),
      endTime: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
      area: 'South',
      activityType: 'Other',
      hostId: 'user-3',
      hostName: 'Zoe',
      attendees: ['Zoe'],
      comments: [],
    },
  ]

  localStorage.setItem('the-move-moves', JSON.stringify(moves))
  render(<App />)

  expect(screen.getByText('Live Now')).toBeInTheDocument()
  expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0)
  expect(screen.getByText('Past')).toBeInTheDocument()
})
