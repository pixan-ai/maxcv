# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in MaxCV, please report it responsibly.

**Email:** [security@maxcv.org](mailto:security@maxcv.org)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Resolution:** Depends on severity, but we aim for patches within 14 days for critical issues

## Scope

The following are in scope:
- `maxcv.org` and `dev.maxcv.org`
- The MaxCV application code in this repository
- API endpoints under `/api/*`

The following are **out of scope:**
- Third-party services (Vercel, Anthropic, GitHub)
- Social engineering attacks
- Denial of service attacks
- Issues in dependencies (report these to the upstream project)

## Security Practices

- **No data storage:** CVs are processed in real time and discarded immediately
- **No accounts or databases:** No user data to breach
- **TLS/SSL:** All communications encrypted in transit
- **Security headers:** HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Input sanitization:** User input is sanitized before processing
- **Rate limiting:** 7 requests/hour per IP to prevent abuse
- **API key protection:** Anthropic API key is server-side only, never exposed to the client
- **Open source:** Full code is auditable at [github.com/pixan-ai/maxcv](https://github.com/pixan-ai/maxcv)

## Responsible Disclosure

We ask that you:
- Give us reasonable time to fix the issue before public disclosure
- Do not access or modify other users' data
- Do not degrade the service for others

We will credit reporters in our changelog (unless you prefer to remain anonymous).

---

*Last updated: April 2026*
