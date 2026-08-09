import MyStores from "../components/MyStores";
import { useNodesStore } from "@/shared/store/nodesStore";

export default function Dashboard() {
  const isPlatformAdmin = useNodesStore((state) => state.isPlatformAdmin());
  return (
    <div className="flex flex-col gap-4">
      {isPlatformAdmin && (
        <div className="flex items-center justify-end mb-4">
          <a
            href="/node/new"
            className="btn btn-success hover:btn-success cursor-pointer"
          >
            Add Node
          </a>
        </div>
      )}
      <MyStores />
    </div>
  );
}
