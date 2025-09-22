import RSVPListWrapper from '../components/RSVPListWrapper';

const contacts = [
  { name: 'ABC', role: 'Team' },
  { name: 'DEF', role: 'Member' },
  { name: 'GHI', role: 'Member' },
  { name: 'JKL', role: 'Member' },
  { name: 'MNO', role: 'Member' },
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
