import { useAuthStore } from "../../../shared/store/authStore";

export default function Dashboard() {
  const { member } = useAuthStore();

  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-semibold text-text">
        Welcome{member?.name ? `, ${member.name}` : ""} 👋
      </h1>
      <p className="mt-2 text-text-muted">{member?.email}</p>
    </div>
  );
}
