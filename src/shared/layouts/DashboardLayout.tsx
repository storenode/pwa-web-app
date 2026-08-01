import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useNavStore } from "../store/navStore";
import Navbar from "./components/Navbar";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";

interface DrawerForm {
  drawerOpen: boolean;
}

export default function DashboardLayout() {
  const location = useLocation();
  const setActiveLink = useNavStore((state) => state.setActiveLink);
  const { register } = useForm<DrawerForm>({
    defaultValues: { drawerOpen: true },
  });

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname, setActiveLink]);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="dashboard-drawer"
        type="checkbox"
        className="drawer-toggle"
        {...register("drawerOpen")}
      />
      <div className="drawer-content flex flex-col h-screen">
        <Navbar />
        <main className="flex-1 min-h-0 overflow-y-auto p-4 bg-base-50">
          <Outlet />
        </main>
        <Footer />
      </div>
      <div className="drawer-side is-drawer-close:overflow-visible">
        <label
          htmlFor="dashboard-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="h-screen overflow-y-auto">
          <SideNav />
        </div>
      </div>
    </div>
  );
}
