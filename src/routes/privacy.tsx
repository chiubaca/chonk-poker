import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto pt-8 sm:pt-16 pb-8">
        <div className="card bg-base-200 shadow-xl border-4 border-base-300 rounded-3xl p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8">
            Privacy Policy
          </h1>

          <div className="space-y-8 text-base-content/90">
            <section>
              <h2 className="text-xl font-bold mb-2">1. Introduction</h2>
              <p>
                Chonk Poker (“we”, “us”, or “our”) respects your privacy. This Privacy Policy
                explains how we collect, use, and protect your personal information when you use our
                planning-poker service at{" "}
                <code className="text-sm bg-base-300 px-1 py-0.5 rounded">
                  chonk-poker.chiubaca.com
                </code>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">2. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Account Information:</strong> When you sign in via Google OAuth, we
                  receive your name, email address, and profile picture URL.
                </li>
                <li>
                  <strong>Session Data:</strong> We issue essential session cookies to keep you
                  logged in. Our authentication system may also record your IP address and browser
                  user-agent string for security and anti-abuse purposes.
                </li>
                <li>
                  <strong>Room & Game Data:</strong> We store your room memberships in our database
                  (D1) and process real-time game state—including votes, player presence, and game
                  actions—via WebSockets and Cloudflare Durable Objects.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To authenticate you and maintain your session.</li>
                <li>To enable room creation, joining, and real-time gameplay.</li>
                <li>To secure the Service and investigate abuse.</li>
                <li>To improve performance and fix bugs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">4. Cookies & Tracking</h2>
              <p>
                We use only essential cookies for authentication. These cookies are marked{" "}
                <code className="text-sm bg-base-300 px-1 py-0.5 rounded">Secure</code>,{" "}
                <code className="text-sm bg-base-300 px-1 py-0.5 rounded">SameSite=None</code>, and{" "}
                <code className="text-sm bg-base-300 px-1 py-0.5 rounded">Partitioned</code> so the
                Service can function inside embedded contexts (for example, Google Meet add-ons). We
                do <strong>not</strong> use advertising or analytics tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">5. Third-Party Services</h2>
              <p>
                We use <strong>Google OAuth</strong> for sign-in. Your use of Google sign-in is
                subject to{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  Google’s Privacy Policy
                </a>
                .
              </p>
              <p className="mt-1">
                We do not share your personal data with any other third parties except our
                infrastructure provider, <strong>Cloudflare</strong>, which hosts the Service and
                processes data on our behalf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">6. Data Retention</h2>
              <p>
                We retain your account data as long as your account remains active. Room membership
                records and game-state data may be retained for operational purposes and cleaned up
                periodically. Real-time game votes are ephemeral and exist only while a room is
                active.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">7. Data Security</h2>
              <p>
                We implement reasonable technical and organisational measures to protect your data.
                However, no internet transmission or electronic storage is completely secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">8. Your Rights</h2>
              <p>
                Depending on your jurisdiction, you may have the right to access, correct, or delete
                your personal data. To request deletion of your account and associated data, please
                contact us (see below).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">9. Children’s Privacy</h2>
              <p>
                The Service is not directed to children under 13. We do not knowingly collect
                personal data from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this
                page with an updated effective date. Continued use of the Service after changes
                constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">11. Contact Us</h2>
              <p>
                For privacy questions or data-deletion requests, please open an issue on the project
                repository or contact the operator through the channels associated with{" "}
                <code className="text-sm bg-base-300 px-1 py-0.5 rounded">
                  chonk-poker.chiubaca.com
                </code>
                .
              </p>
            </section>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <Link to="/" className="btn btn-ghost rounded-xl">
              ← Back to home
            </Link>
            <Link to="/terms" className="link link-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
