import { Outlet } from "react-router-dom";
import PublicHeaderView from "./components/header";
import PublicFooterView from "./components/footer";

export default function PublicLayout() {
  return (
    <>
      <PublicHeaderView />
      <main className="flex-1 bg-bg">
        <Outlet />
      </main>
      <PublicFooterView />
    </>
  );
}
