import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto pt-8 sm:pt-16 pb-8">
        <div className="card bg-base-200 shadow-xl border-4 border-base-300 rounded-3xl p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8">
            Terms of Service
          </h1>

          <div className="space-y-8 text-base-content/90">
            <section>
              <h2 className="text-xl font-bold mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Chonk Poker (the “Service”), you agree to be bound by these
                Terms of Service (“Terms”). If you do not agree to these Terms, do not use the
                Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">2. Description of Service</h2>
              <p>
                Chonk Poker is a free online planning-poker / agile-estimation tool. It lets users
                create and join game rooms to cast, lock in, and reveal estimation votes in real
                time. The Service is provided on an “as is” and “as available” basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">3. Eligibility</h2>
              <p>
                You must be at least 13 years old (or the age of legal majority in your
                jurisdiction) to use the Service. If you are under 18, you represent that you have
                the consent of a parent or guardian.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">4. User Accounts</h2>
              <p>
                We use <strong>Google OAuth</strong> for authentication. You are responsible for
                maintaining the confidentiality of your account and for all activities that occur
                under it. You agree to notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">5. User Content & Conduct</h2>
              <p>
                You may create rooms, invite others, and participate in games. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>
                  Use the Service for any unlawful purpose or transmit harmful or offensive content.
                </li>
                <li>
                  Attempt to disrupt, interfere with, or gain unauthorized access to the Service or
                  other users’ accounts.
                </li>
                <li>Impersonate another person or misrepresent your affiliation.</li>
                <li>Use automated scripts or bots to interact with the Service.</li>
              </ul>
              <p className="mt-2">
                The first player in a room may boot other players. This feature must be used
                responsibly; abusive use may result in suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">6. Data & Room State</h2>
              <p>
                Game state (including votes, player presence, and actions) is processed in real time
                via WebSockets and Cloudflare Durable Objects. While we strive for reliability, we
                do not guarantee the persistence of historical game data beyond the active session.
                Room membership records are stored in our database (D1) and may be cleaned up
                periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">7. Intellectual Property</h2>
              <p>
                The Service, its design, logos, and underlying code are the property of the
                operator. You retain any rights to the data you input, but you grant us a limited,
                non-exclusive license to process it solely for the purpose of operating the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">8. Termination</h2>
              <p>
                We may suspend or terminate your access to the Service at any time, with or without
                cause and with or without notice, for any reason including breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE OPERATOR BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
                LOSS OF PROFITS OR DATA, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE
                SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective
                when posted. Your continued use of the Service after changes constitutes acceptance
                of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                jurisdiction in which the Service operator is located, without regard to conflict of
                law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">13. Contact</h2>
              <p>
                For questions about these Terms, please open an issue on the project repository or
                contact the operator through the channels associated with{" "}
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
            <Link to="/privacy" className="link link-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
