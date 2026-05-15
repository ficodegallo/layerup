# Layer Up Roadmap

## Security Follow-Ups

### High Priority

- [ ] Add bot protection to the signup form with Cloudflare Turnstile or hCaptcha.
  Why: The current honeypot and in-memory throttling help, but a real challenge layer will reduce automated abuse much more effectively.

- [ ] Replace the in-memory signup rate limiter with a shared store such as Upstash Redis.
  Why: The current limiter only protects a single server instance. A shared rate-limit store will work consistently across serverless instances and deployments.

- [ ] Add signed subscriber management links for unsubscribe and preference updates.
  Why: Email-based identity alone should not be enough to change subscriber settings. Signed links give subscribers a secure self-serve path without requiring passwords.

### Medium Priority

- [ ] Add automatic cleanup for expired `PendingSignup` records and stale verification tokens.
  Why: This keeps the database smaller, reduces retained personal data, and limits the lifetime of unused verification records.

- [ ] Add structured audit logging for signup, confirmation, unsubscribe, and preference-change events.
  Why: This makes abuse review and incident response much easier without depending on ad hoc log searches.

- [ ] Add alerting for suspicious signup activity and repeated verification failures.
  Why: Basic monitoring will help catch abuse spikes early once promotion starts.

- [ ] Lock down internal tooling further by moving preview/debug routes behind auth or out of the production app entirely.
  Why: They now return `404` in production, which is good, but long-term it is cleaner to keep operational tooling fully separate from the public deployment.

### Nice to Have

- [ ] Add automated dependency security monitoring and a monthly patch pass.
  Why: This gives us a repeatable way to address framework and package advisories before they pile up.

- [ ] Review SendGrid, Vercel, Railway, and GitHub credentials for least-privilege access and rotate them on a schedule.
  Why: Credential hygiene matters more once the product becomes public.

- [ ] Add a simple retention and deletion policy for subscriber and child-profile data.
  Why: The app now stores household information, so we should be intentional about how long we keep unused or inactive records.

- [ ] Add a lightweight security checklist for pre-launch and post-launch releases.
  Why: A short checklist helps us consistently verify headers, bot protection, migrations, and internal route exposure before promoting changes.

## Product and Design Ideas

### Email Experience

- [ ] Add more weather detail to the daily email, including UV index.
  Why: This gives subscribers better context for sunscreen, hats, and longer outdoor time without making them open another weather app.

- [ ] Add allergen or pollen counts to the daily email.
  Why: This would make Layer Up more useful for households planning around allergies, school drop-off, walks, and time outside.
