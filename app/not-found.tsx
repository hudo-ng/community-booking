import Link from "next/link";
export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">Check the URL or go back home.</p>
      <Link className="btn btn-primary mt-6" href="/">
        Go Home
      </Link>
    </div>
  );
}
