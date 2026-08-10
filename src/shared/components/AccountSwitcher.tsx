import { Link } from "react-router-dom";

export default function AccountSwitcher() {
  return (
    <Link to="/launch" className="btn btn-neutral btn-sm">
      Switch Account
    </Link>
  );
}
