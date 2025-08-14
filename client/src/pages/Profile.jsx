import { Favourites } from "../components/Favourites.jsx";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { ProfileInfo } from "../components/ProfileInfo.jsx";

export const Profile = () => {
  return (
    <div className="flex flex-col min-h-screen gap-4">
      <Navbar />
      {/* Add Account Component */}
      <ProfileInfo />
      {/* Add Favorites Component */}
      <Favourites />
      {/* Add Orders Component */}
      {/* Add Reviews Component */}
      <Footer />
    </div>
  );
};
