import { StoreNodeLogo } from "../../../shared/components/StoreNodeLogo";
import GoogleLoginButton from "../../../shared/fields/GoogleLogin.Button";

export default function PublicFooterView() {
  return (
    <footer className="bg-surface">
      <div className="container px-6 py-8 mx-auto">
        <div className="flex flex-col items-center text-center">
          <a href="#">
            <StoreNodeLogo />
          </a>

          <p className="max-w-lg mx-auto mt-4 text-text-muted">
            StoreNode · store operating system
            <br />
            మీ షాప్ కోసం, మీ భాషలో.
          </p>

          <div className="flex flex-col justify-center mt-4 sm:flex-row sm:items-center sm:justify-center">
            <GoogleLoginButton />
          </div>
        </div>

        <hr className="my-10 border-border" />

        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <p className="text-sm text-text-muted">
            © Copyright 2021. All Rights Reserved.
          </p>

          <div className="flex mt-3 -mx-2 sm:mt-0">
            <a
              href="#"
              className="mx-2 text-sm text-text-muted transition-colors duration-300 hover:text-text"
              aria-label="Reddit"
            >
              {" "}
              Teams{" "}
            </a>

            <a
              href="#"
              className="mx-2 text-sm text-text-muted transition-colors duration-300 hover:text-text"
              aria-label="Reddit"
            >
              {" "}
              Privacy{" "}
            </a>

            <a
              href="#"
              className="mx-2 text-sm text-text-muted transition-colors duration-300 hover:text-text"
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
