import { Link } from "react-router-dom";
import { useNavStore } from "../../store/navStore";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="2"
        fill="none"
        stroke="currentColor"
        className="my-1.5 inline-block size-4"
      >
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
    ),
  },
];

export default function SideNav() {
  const activeLink = useNavStore((state) => state.activeLink);

  return (
    <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
      <ul className="menu w-full grow">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${
                activeLink === item.path ? "menu-active" : ""
              }`}
              data-tip={item.label}
            >
              {item.icon}
              <span className="is-drawer-close:hidden">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
