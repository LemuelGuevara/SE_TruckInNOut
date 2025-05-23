"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import SettingsOverlayTwo from "@/components/SettingsOverlayTwo";
import { logout } from "@/auth/auth.actions";

const Menu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>     
      <div className="mt-4 text-sm relative flex flex-col gap-3">
      <Image src="/bigc.png" alt="Logo" width={180} height={180} className="mx-auto" />
        {/* Dashboard */}
        <Link
          href="/dashboard/admin/home"
          className={`flex items-center justify-center lg:justify-start gap-5 text-white py-2 rounded-lg transition duration-200 hover:bg-black/25 ${
            pathname === "/dashboard/admin/home" ? "bg-black/25" : ""
          }`}
        >
          <Image src="/homee.png" alt="Dashboard" width={30} height={30} />
          <span className="hidden lg:block">Dashboard</span>
        </Link>

        {/* View Deliveries */}
        <Link
          href="/dashboard/admin/viewdeliveries"
          className={`flex items-center justify-center lg:justify-start gap-5 text-white py-2 rounded-lg transition duration-200 hover:bg-black/25 ${
            pathname === "/dashboard/admin/viewdeliveries" ? "bg-black/25" : ""
          }`}
        >
          <Image src="/deliveries.png" alt="View Deliveries" width={30} height={30} />
          <span className="hidden lg:block">Deliveries</span>
        </Link>

        {/* Manage Payroll */}
        <Link
          href="/dashboard/admin/managepayroll"
          className={`flex items-center justify-center lg:justify-start gap-5 text-white py-2 rounded-lg transition duration-200 hover:bg-black/25 ${
            pathname === "/dashboard/admin/managepayroll" ? "bg-black/25" : ""
          }`}
        >
          <Image src="/payroll.png" alt="Manage Payroll" width={30} height={30} />
          <span className="hidden lg:block">Payroll</span>
        </Link>

        {/* Accounts */}
        <Link
          href="/dashboard/admin/accounts"
          className={`flex items-center justify-center lg:justify-start gap-5 text-white py-2 rounded-lg transition duration-200 hover:bg-black/25 ${
            pathname === "/dashboard/admin/accounts" ? "bg-black/25" : ""
          }`}
        >
          <Image src="/accounts.png" alt="Accounts" width={30} height={30} />
          <span className="hidden lg:block">Accounts</span>
        </Link>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center justify-center lg:justify-start gap-5 text-white py-2 rounded-lg transition duration-200 hover:bg-black/25"
        >
          <Image src="/settings.png" alt="Settings" width={30} height={30} />
          <span className="hidden lg:block">Settings</span>
        </button>

        {/* Logout */}
        <button
          onClick={async () => {
            await logout();
            router.push("/login");
            router.refresh();
          }}
          className="flex items-center justify-center lg:justify-start gap-5 text-white py-2 rounded-lg transition duration-200 hover:bg-black/25"
        >
          <Image src="/logoutt.png" alt="Logout" width={30} height={30} />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <SettingsOverlayTwo onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default Menu;
