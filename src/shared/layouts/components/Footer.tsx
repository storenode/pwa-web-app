export default function Footer() {
  return (
    <footer className="footer sm:footer-horizontal footer-center bg-base-50 border-t border-base-300 text-base-content p-4">
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All rights reserved by
          SelfNode
        </p>
      </aside>
    </footer>
  );
}
