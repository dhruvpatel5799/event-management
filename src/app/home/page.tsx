import { Suspense } from 'react';
import CountdownBox from '../components/CountdownBox';
import MasonryGrid from '../components/MasonryGrid';

export default function Home() {
  return (
    <>
      <CountdownBox />
      <Suspense fallback={<div>Loading...</div>}>
        <MasonryGrid />
      </Suspense>
    </>
  );
}