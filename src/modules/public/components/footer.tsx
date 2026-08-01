import { LogoDark } from "../../../shared/components/LogoDark";
import { LogoLight } from "../../../shared/components/LogoLight";
import GoogleLoginButton from "../../../shared/fields/GoogleLogin.Button";

export default function PublicFooterView() {
  return (
    <footer className="bg-base-100">
      <div className="container px-6 py-8 mx-auto">
        <div className="flex flex-col items-center text-center">
          <a href="#">
            <LogoLight className="h-20 sm:h-18 w-auto shrink-0 dark:hidden" />
            <LogoDark className="h-20 sm:h-18 w-auto shrink-0 hidden dark:block" />
          </a>

          <p className="max-w-lg mx-auto mt-4 text-base-content/60">
            StoreNode · store operating system
            <br />
            మీ షాప్ కోసం, మీ భాషలో.
          </p>

          <div className="flex flex-col justify-center mt-4 sm:flex-row sm:items-center sm:justify-center">
            <GoogleLoginButton />
          </div>
        </div>

        <hr className="my-10 border-base-300" />

        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <p className="text-sm text-base-content/60">
            © Copyright 2021. All Rights Reserved.
          </p>

          <div className="flex mt-3 -mx-2 sm:mt-0">
            <a
              href="#"
              className="mx-2 text-sm text-base-content/60 transition-colors duration-300 hover:text-base-content"
              aria-label="Reddit"
            >
              {" "}
              Teams{" "}
            </a>

            <a
              href="#"
              className="mx-2 text-sm text-base-content/60 transition-colors duration-300 hover:text-base-content"
              aria-label="Reddit"
            >
              {" "}
              Privacy{" "}
            </a>

            <a
              href="#"
              className="mx-2 text-sm text-base-content/60 transition-colors duration-300 hover:text-base-content"
              aria-label="Reddit"
            >
              {" "}
              Cookies{" "}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
