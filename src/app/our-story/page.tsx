import './page.css';
import story from '@/app/pics/Story.png';

export default function OurStory() {
  return (
    <div className="text-center bg-[#f5e3c8] py-8 font-serif absolute w-full -z-2">
      <p className="text-[18px] text-[#800000] font-semibold mb-2">MEET THE COUPLE</p>

      <div className="relative justify-self-center text-white text-2xl italic font-medium w-3xs h-10 bg-rose-500 rounded-sm m-6 p-2
           before:absolute before:-left-10  before:top-1/2 before:-z-1 before:w-16 before:h-10 before:-rotate-6 before:border-y-20 before:border-y-rose-500 before:border-x-20 before:border-r-rose-700 before:border-l-transparent
           after:absolute  after:-right-10  after:top-1/2 after:-z-1 after:w-16 after:h-10 after:rotate-6 after:border-y-20 after:border-y-rose-500 after:border-x-20 after:border-l-rose-700 after:border-r-transparent">
        Dhruv & Dhruv
      </div>

      <p className="text-[16px] text-[#800000] mt-2">AND THEIR LOVE STORY</p>
      
        <div className="relative inline-block bg-[#00a97f] px-10 py-2 text-white font-[cursive] text-2xl italic font-medium">
          <span>Dhruv & Dhruv</span>

          {/* Left ribbon tail */}
          <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[20px] border-r-[#00a97f]"></div>

          {/* Right ribbon tail */}
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[20px] border-l-[#00a97f]"></div>
        </div>
        
        <div className="banner text-white font-cursive italic">
            A Simple CSS banner
        </div>

        <img src={story.src} alt="Story" className="w-full h-auto mt-55" />
    </div>
  );
}