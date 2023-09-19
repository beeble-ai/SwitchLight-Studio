import { Navbar } from "flowbite-react";
import { FiSettings } from "react-icons/fi";
import { ReactElement } from "react";

interface UserProfileIconProps {
  profileImageUrl: string;
  size?: number;
}

export const UserProfileIcon = ({
  profileImageUrl,
  size,
}: UserProfileIconProps) => {
  return (
    <>
      <div className="bg-gray-500 rounded-full">
        <img
          src={profileImageUrl}
          alt="user-profile"
          width={size ?? 30}
          height={size ?? 30}
          style={{ borderRadius: "100%" }}
        />
      </div>
    </>
  );
};

export const SLNavbar = (): ReactElement => {
  return (
    <>
      <Navbar
        fluid
        className="bg-black"
        style={{ width: "100%", top: 0, zIndex: 9999 }}
      >
        <Navbar.Brand href="/">
          <img
            alt="SwitchLight Logo"
            className="h-6 m-2 ml-3"
            src="/assets/images/switchlight-logo-product-xl.png"
          />
        </Navbar.Brand>
        <a href="/account" className="justify-end mx-3 p-2">
          <FiSettings size={20} />
        </a>
      </Navbar>
    </>
  );
};
