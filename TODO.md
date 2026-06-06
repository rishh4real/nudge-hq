# NudgeHQ TODO

This tracks what is built, what is active, and what should come next.

## Built

- Modern landing page with hero, pricing, security, FAQ, final CTA, footer, and polished brand styling.
- Signal wall/dome style landing section with animated visual treatment.
- Mobile app launching-soon banner with phone mockup.
- Real contact page and full NudgeAI page.
- Privacy Policy and Terms pages.
- Company signup, email verification, choose-plan, payment, and onboarding flow.
- Invite flow with employee invitation email, set-password page, and magic join link foundation.
- Four-role product foundation: Admin, HR, Manager, Employee.
- Demo console kept separate at `/demo`.
- Employee dashboard UI polish: sidebar, stats, empty states, check-in, progress chart, growth portal, NudgeAI helper, NudgeSpace, settings/profile.
- NudgeAI helper can answer general questions through the backend assistant route.
- Backend Express server with Supabase, Groq, Nodemailer, Razorpay, auth middleware, and grouped routes.
- Supabase schema for organizations, users, departments, tasks, updates, blockers, invites, AI outputs, focus, check-ins, deep work, reports, and notifications.
- Postman collection and environment files.
- WebGL/OGL `Ferrofluid` animation component.

## In Progress

- Manager dashboard polish.
- Mirroring polished demo dashboard experiences into the real OG product dashboards.
- Removing fake/demo data from OG pages so real accounts start empty until HR/admin assigns data.
- Session/nav behavior: signed-in users should stay signed in and still visit landing pages without losing session.
- Payment page copy and UI polish.
- NudgeSpace redesign and persistence behavior.
- Invite acceptance reliability and token handling.

## Next Priority

1. Polish Manager dashboard:
   - Team Tasks, Completion Rate, Active Blockers, Active Today stat cards.
   - Greeting should use manager name, not department name.
   - NudgeAI Morning Brief at top.
   - Quick actions: Assign Task, Export Report, Send Team Nudge.
   - Active Blockers alert card.
   - Team Progress table with Last Update column.
   - Recent Activity expandable rows.
   - Remove Integrations from sidebar and make Projects a coming-soon page.

2. Copy polished Manager dashboard into OG manager route.

3. Polish HR dashboard:
   - People health.
   - Burnout risk.
   - Attendance/check-in patterns.
   - Skill gaps.
   - Reports and board pack.

4. Polish Admin dashboard:
   - All-role control center.
   - Billing/settings.
   - Role management.
   - Invite and department management.

5. Improve onboarding:
   - Better UI for all steps.
   - Company logo upload.
   - Company type custom input when "Other" selected.
   - Back button on steps 2 and 3.
   - Enforce employee plan limits.

6. Make file/profile uploads real:
   - Supabase Storage for profile pictures, company logos, screenshots, PDFs.

7. Upgrade PDF/report exports:
   - Better 90-day growth PDF styling.
   - Board pack PDF for admin/HR.

8. Improve email deliverability:
   - Move from Gmail SMTP to domain email later.
   - Add SPF, DKIM, DMARC when domain is ready.

9. Production readiness:
   - Clean environment documentation.
   - Deployment steps.
   - CI/build checks.
   - More route/API tests.

## Stable Areas

- Do not change `/demo` unless working on demo.
- Do not change DB schema unless the task needs database changes.
- Do not touch secrets in `.env*`.
- Do not edit lockfiles unless installing/removing packages.

## Useful Prompt Starter

```text
Read CONTEXT.md and ROUTES.md first.
Then do: [specific task]
```
