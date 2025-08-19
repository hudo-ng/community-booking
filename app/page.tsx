export default function Home() {
  return (
    <section className="space-y-10">
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Book local services{" "}
          <span className="text-gray-500">without the hassle</span>
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Discover community-based providers and schedule appointments in
          minutes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a className="btn btn-primary" href="/about">
            Learn more
          </a>
          <a className="btn" href="/contact">
            Contact us
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Search",
            desc: "Browse by category, ratings, and distance.",
          },
          { title: "Book", desc: "Pick a time that works for you." },
          {
            title: "Manage",
            desc: "Reschedule, cancel, and track appointments.",
          },
        ].map((item) => (
          <div key={item.title} className="card">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
