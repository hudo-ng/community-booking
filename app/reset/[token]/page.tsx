import { resetPassword } from "./reset-actions";
import NotFound from "@/app/not-found";

type paramP = Promise<{ token: string }>;

export default async function ResetPasswordPage({
  params,
}: {
  params: paramP;
}) {
  const { token } = await params;
  if (!token) NotFound();
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-center text-3xl font-semibold text-gray-900 dark:text-white">
          Set a New Password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your new password and confirm to update your account
          credentials.
        </p>

        <form action={resetPassword} className="mt-6 space-y-5">
          <input type="hidden" name="token" value={token} />

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter new password"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              placeholder="Confirm new password"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium transition-all duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Update Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to login
          </a>
        </div>
      </div>
    </section>
  );
}
