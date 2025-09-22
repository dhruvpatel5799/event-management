'use client';

import { useState } from 'react';
import RSVPListToggle from './RSVPListToggle';
import HumansList from './HumansList';

type Human = {
  name: string;
  role: string;
};

type RSVPListWrapperProps = {
  groomGuests: Human[];
  brideGuests: Human[];
};

export default function RSVPListWrapper({ groomGuests, brideGuests }: RSVPListWrapperProps) {
  const [selectedTab, setSelectedTab] = useState<'groom' | 'bride'>('groom');

  return (
    <>
      <RSVPListToggle selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <div className="flex flex-col md:flex-row md:space-x-4">
        <div
          className={`w-full md:w-1/2 ${selectedTab !== 'groom' ? 'hidden' : ''} md:block`}
        >
          <HumansList title="Groom's RSVP" humans={groomGuests} />
        </div>

        <div
          className={`w-full md:w-1/2 ${selectedTab !== 'bride' ? 'hidden' : ''} md:block`}
        >
          <HumansList title="Bride's RSVP" humans={brideGuests} />
        </div>
      </div>
    </>
  );
}
