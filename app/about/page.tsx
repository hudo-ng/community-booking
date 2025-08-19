export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="prose max-w-none">
      <h1>About</h1>
      <p>
        Community Booking is an open, modern platform helping local providers
        reach customers with simple scheduling and payments.
      </p>
      <h2>What we’re building</h2>
      <ul>
        <li>Provider profiles & discoverability</li>
        <li>Frictionless booking</li>
        <li>Transparent reviews & ratings</li>
      </ul>
    </article>
  );
}
