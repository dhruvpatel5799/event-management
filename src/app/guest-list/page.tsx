import RSVPListWrapper from '../components/RSVPListWrapper';

const contacts = [
  { name: 'ABC', role: 'Team' },
  { name: 'DEF', role: 'Member' },
  { name: 'GHI', role: 'Member' },
  { name: 'JKL', role: 'Member' },
  { name: 'MNO', role: 'Member' },
  { name: 'PQR', role: 'Member' },
  { name: 'STU', role: 'Member' },
  { name: 'VWX', role: 'Member' },
  { name: 'YZA', role: 'Member' },
  { name: 'BCD', role: 'Member' },
  { name: 'EFG', role: 'Member' },
  { name: 'HIJ', role: 'Member' },
  { name: 'KLM', role: 'Member' },
  { name: 'NOP', role: 'Member' },
  { name: 'QRS', role: 'Member' },
  { name: 'TUV', role: 'Member' },
  { name: 'WXY', role: 'Member' },
  { name: 'ZAB', role: 'Member' },
  { name: 'CDE', role: 'Member' },
  { name: 'FGH', role: 'Member' },
  { name: 'IJK', role: 'Member' },
  { name: 'LMN', role: 'Member' },
  { name: 'OPQ', role: 'Member' },
  { name: 'RST', role: 'Member' },
  { name: 'UVW', role: 'Member' },
  { name: 'XYZ', role: 'Member' },
];

export default function GuestList() {
  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-black">Our Esteemed Guests</h1>

      {/* Contact List */}
      <RSVPListWrapper groomGuests={contacts} brideGuests={contacts} />
    </div>
  );
}
