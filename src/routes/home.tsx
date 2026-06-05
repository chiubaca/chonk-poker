import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-2xl">😸</span>
          <span className="font-bold text-sm text-primary">
            Free. No sign-up required to spectate.
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
          Planning poker,
          <br />
          but make it chonky.
        </h1>
        <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto mb-10">
          Chonk Poker is a real-time, browser-based planning-poker app for agile teams. Create a
          room, invite your teammates, and estimate stories together—no spreadsheets, no fuss, just
          fast consensus.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="btn btn-primary btn-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold text-base px-8"
          >
            Get started →
          </Link>
          <Link to="/terms" className="btn btn-ghost btn-lg rounded-2xl font-bold text-base">
            Read the Terms
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Create a room",
              body: "Hit one button to spin up a new room. You get a short shareable code (e.g. #A1B2C).",
            },
            {
              step: "2",
              title: "Invite the team",
              body: "Share the room code or URL. Teammates join instantly—no installs, no friction.",
            },
            {
              step: "3",
              title: "Cast your vote",
              body: "Everyone picks a card value. Your vote stays hidden until everyone locks in.",
            },
            {
              step: "4",
              title: "Reveal & discuss",
              body: "The room owner reveals all votes. Discuss outliers, re-vote if needed, then reset for the next story.",
            },
          ].map((card) => (
            <div
              key={card.step}
              className="card bg-base-200 border-4 border-base-300 rounded-3xl p-6 hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-lg mb-4 shadow-md">
                {card.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-base-content/70 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Why Chonk Poker?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: "⚡",
              title: "Real-time sync",
              body: "Built on WebSockets and Cloudflare Durable Objects so state updates instantly for everyone in the room.",
            },
            {
              icon: "🐱",
              title: "Delightfully simple",
              body: "No bloat, no confusing settings. Just create, join, vote, reveal. The chonk theme is the cherry on top.",
            },
            {
              icon: "🔒",
              title: "Secure by default",
              body: "Google OAuth sign-in, encrypted sessions, and partitioned cookies. We don’t sell your data.",
            },
            {
              icon: "🪶",
              title: "Lightweight",
              body: "Runs entirely in the browser. No desktop app, no browser extension needed (unless you want the Meet add-on).",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card bg-base-200 border-4 border-base-300 rounded-3xl p-6 flex items-start gap-4"
            >
              <div className="text-3xl shrink-0">{feature.icon}</div>
              <div>
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-4 border-primary/20 rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ready to estimate?
          </h2>
          <p className="text-base-content/70 mb-8 max-w-xl mx-auto">
            Jump in and create your first room. It takes less time than brewing a cup of coffee.
          </p>
          <Link
            to="/"
            className="btn btn-primary btn-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold text-base px-10"
          >
            Create a room
          </Link>
        </div>
      </section>
    </div>
  );
}
