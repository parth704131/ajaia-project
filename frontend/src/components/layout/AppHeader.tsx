import { ChevronDown, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../state/store";

export function AppHeader() {
  const users = useUserStore((state) => state.users);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const selectUser = useUserStore((state) => state.selectUser);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-ink-950 no-underline"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-moss-700 text-white shadow-sm">
            <FileText size={18} strokeWidth={2.3} />
          </span>
          <span className="text-lg font-bold tracking-[-0.03em]">
            Ajaia Docs
          </span>
        </Link>

        <div className="relative flex items-center">
          <span className="mr-3 hidden text-xs font-semibold uppercase tracking-[0.14em] text-ink-500 sm:block">
            Viewing as
          </span>
          <select
            value={currentUserId ?? ""}
            onChange={(event) => selectUser(event.target.value)}
            className="appearance-none rounded-xl border border-line bg-white py-2.5 pl-3.5 pr-9 text-sm font-semibold text-ink-950 outline-none transition focus:border-moss-600 focus:ring-4 focus:ring-moss-100"
            aria-label="Select demo user"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 text-ink-500"
            size={15}
          />
        </div>
      </div>
    </header>
  );
}
