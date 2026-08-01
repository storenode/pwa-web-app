import { useAuthStore } from "../../../shared/store/authStore";

export default function Dashboard() {
  const { member } = useAuthStore();

  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-semibold text-base-content">
        Welcome{member?.name ? `, ${member.name}` : ""} 👋
      </h1>
      <p className="mt-2 text-base-content/60">{member?.email}</p>
    </div>
  );
}
