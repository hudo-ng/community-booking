import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setUserRole, setUserStatus } from "./action";
import ToasterFromSearchParams from "@/components/ToasterFromSearchParams";

export const metadata = { title: "User Management" };

export default async function UsersPage() {
  const s = await getServerSession(authOptions);
  if (!s?.user || s.user.role !== "SUPERADMIN") redirect("/login");

  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });

  const roleBadge = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "ADMIN":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PROVIDER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6">
      <ToasterFromSearchParams />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Users
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage roles for all registered accounts.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Total: <strong className="font-medium">{users.length}</strong>
        </span>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 sm:p-5">
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-600 bg-gray-50 sticky top-0">
                <tr>
                  <th className="py-2.5 pl-4 pr-3 sm:pl-5">Email</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Change</th>
                  <th className="py-2.5 px-3">Active</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr
                    key={u.UserId}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50"
                  >
                    <td className="py-2.5 pl-4 pr-3 sm:pl-5 align-middle">
                      <div className="truncate max-w-[320px]">{u.email}</div>
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      {u.name ?? <span className="text-gray-400">—</span>}
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${roleBadge(
                          u.role as string
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      <form
                        action={setUserRole}
                        className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
                      >
                        <input type="hidden" name="id" value={u.UserId} />
                        <label className="sr-only" htmlFor={`role-${u.UserId}`}>
                          Change role for {u.email}
                        </label>
                        <select
                          id={`role-${u.UserId}`}
                          name="role"
                          defaultValue={u.role}
                          className="h-10 w-full sm:w-44 rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="PROVIDER">PROVIDER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPERADMIN">SUPERADMIN</option>
                        </select>

                        <button
                          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow
                                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Save
                        </button>
                      </form>
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      <form
                        action={setUserStatus}
                        className="flex items-center justify-center"
                      >
                        <input type="hidden" name="id" value={u.UserId} />

                        <button
                          type="submit"
                          aria-label={`Toggle active status for ${u.email}`}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
        ${
          u.isActive
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-300 hover:bg-gray-400"
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${u.isActive ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[11px] text-gray-500">
            Role changes take effect immediately on next request.
          </p>
        </div>
      </div>
    </section>
  );
}
