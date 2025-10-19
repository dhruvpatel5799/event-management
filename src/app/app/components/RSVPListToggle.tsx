'use client';

type RSVPListToggleProps = {
  selectedTab: 'groom' | 'bride';
  setSelectedTab: (tab: 'groom' | 'bride') => void;
};

export default function RSVPListToggle({ selectedTab, setSelectedTab }: RSVPListToggleProps) {
  return (
    <div className="md:hidden flex justify-center mb-4 space-x-2">
      <button
        className={`px-4 py-2 rounded-full text-sm ${
          selectedTab === 'groom'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => setSelectedTab('groom')}
      >
        Groom&#39;s RSVP
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm ${
          selectedTab === 'bride'
            ? 'bg-pink-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => setSelectedTab('bride')}
      >
        Bride&#39;s RSVP
      </button>
    </div>
  );
}
