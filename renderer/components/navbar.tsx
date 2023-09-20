import { Navbar } from "flowbite-react";
import { FiSettings } from "react-icons/fi";
import { ReactElement } from "react";
import { useRouter } from "next/router";


export const SLNavbar = (): ReactElement => {
  const router = useRouter();
  return (
    <>
      <Navbar
        fluid
        className="bg-black"
        style={{ width: "100%", top: 0, zIndex: 9999 }}
      >
        <Navbar.Brand href="/run-engine">
          <img
            alt="SwitchLight Logo"
            className="h-6 m-2 ml-3"
            src="/assets/images/switchlight-logo-product-xl.png"
          />
        </Navbar.Brand>
        {/* {router.pathname === '/run-engine' && (
          <a href="/account" className="justify-end mx-3 p-2">
            <FiSettings size={20} />
          </a>
        )} */}
        <a href="/account" className="justify-end mx-3 p-2">
          <FiSettings size={20} />
        </a>
      </Navbar>
    </>
  );
};
