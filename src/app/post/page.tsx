import { SignedIn, SignedOut } from "@clerk/nextjs";
import ImageUpload from "../components/ImageUpload";
import SignInPopup from "../components/SignInPopup";


export default function Post() {

  return (
    <div>
      <SignedIn>
        <ImageUpload />
      </SignedIn>
      <SignedOut>
        <SignInPopup />
      </SignedOut>
    </div>
  );
}