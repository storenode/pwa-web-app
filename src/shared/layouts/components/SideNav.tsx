import { useState } from "react";
import { Link, matchPath } from "react-router-dom";
import { useNavStore } from "../../store/navStore";
import { LogoLight } from "../../components/LogoLight";
import { LogoDark } from "../../components/LogoDark";

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
  {
    label: "Account",
    path: "/node/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
        />
      </svg>
    ),
    children: [
      {
        label: "Browse All",
        path: "/node/",
      },
      {
        label: "Add-Edit Nodes",
        path: "/node/:nodeId",
      },
    ],
  },
];

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isPathActive(pattern: string, current: string) {
  return !!matchPath(
    { path: normalizePath(pattern), end: !pattern.includes(":") },
    current,
  );
}

export default function SideNav() {
  const activeLink = useNavStore((state) => state.activeLink);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <div className="flex min-h-full flex-col items-start bg-base-50 border-r border-base-300 is-drawer-close:w-14 is-drawer-open:w-64">
      <div className="flex flex-col items-center w-full items-center justify-center py-4 px-2 is-drawer-close:hidden">
        <div className="flex justify-end w-full">
          <label
            htmlFor="dashboard-drawer"
            aria-label="close sidebar"
            className="btn btn-link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </label>
        </div>
        <a
          rel="noopener noreferrer"
          href="#"
          aria-label="Back to homepage"
          className="flex items-center p-2"
        >
          <LogoLight className="h-20 sm:h-18 w-auto shrink-0 dark:hidden" />
          <LogoDark className="h-20 sm:h-18 w-auto shrink-0 hidden dark:block" />
        </a>
      </div>
      <ul className="menu w-full grow">
        {NAV_ITEMS.map((item) => {
          if (!item.children) {
            return (
              <li key={item.path} className="py-2">
                <Link
                  to={item.path}
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${
                    isPathActive(item.path, activeLink) ? "menu-active" : ""
                  }`}
                  data-tip={item.label}
                >
                  {item.icon}
                  <span className="is-drawer-close:hidden">{item.label}</span>
                </Link>
              </li>
            );
          }

          const groupActive = item.children.some((child) =>
            isPathActive(child.path, activeLink),
          );
          const isOpen = openGroups[item.path] ?? groupActive;

          return (
            <li key={item.path} className="py-2">
              <details
                open={isOpen}
                onToggle={(e) => {
                  const open = e.currentTarget.open;
                  setOpenGroups((prev) => ({ ...prev, [item.path]: open }));
                }}
              >
                <summary
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${
                    groupActive ? "menu-active" : ""
                  }`}
                  data-tip={item.label}
                >
                  {item.icon}
                  <span className="is-drawer-close:hidden">{item.label}</span>
                </summary>
                <ul className="is-drawer-close:hidden">
                  {item.children.map((child) => (
                    <li key={child.path} className="py-2">
                      <Link
                        to={child.path}
                        className={
                          isPathActive(child.path, activeLink)
                            ? "menu-active"
                            : ""
                        }
                      >
                        <span className="is-drawer-close:hidden">
                          {child.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
