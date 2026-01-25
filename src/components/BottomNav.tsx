type BottomNavProps = {
  activeTab: 'explore' | 'profile';
  onTabChange: (tab: 'explore' | 'profile') => void;
};

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <button
        className={`nav-item ${activeTab === 'explore' ? 'nav-item--active' : ''}`}
        type="button"
        aria-label="Explore"
        onClick={() => onTabChange('explore')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Explore</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'profile' ? 'nav-item--active' : ''}`}
        type="button"
        aria-label="Profile"
        onClick={() => onTabChange('profile')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>My Moves</span>
      </button>
    </nav>
  );
};
