Verification endpoints and manual test steps

Endpoints (for testing - tokens/codes are returned in responses):

- POST `/api/auth/register` -> INIT registration: creates a `PendingUser` and returns `pendingId` plus `verification.emailCode` and `verification.phoneCode` for testing. Account is not created yet.
- POST `/api/auth/complete-register` -> COMPLETE registration: provide `{ pendingId, emailCode?, phoneCode? }` to finalize and create the actual `User` (either code may be used depending on your verification policy). Returns auth token and created user.
- POST `/api/auth/send-email-verification` { email } -> generates & returns an email OTP code for an existing _User_ or pending registration.
- POST `/api/auth/verify-email` { email, code } -> verifies email using OTP code for an existing _User_ or pending registration.
- POST `/api/auth/send-phone-code` { phone } -> generates & returns phone code for an existing _User_ or pending registration.
- POST `/api/auth/verify-phone` { phone, code } -> verifies phone using OTP code for an existing _User_ or pending registration.

Manual test steps

1. Register a new user (or doctor):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+911234567890","password":"secret"}'
```

Response will include generated `emailCode` and `phoneCode`. Use those to verify.

2. Verify email:

```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"<code-from-response>"}'
```

3. Verify phone:

```bash
curl -X POST http://localhost:5000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"+911234567890","code":"<code-from-response>"}'
```

4. Alternatively, re-request codes:

```bash
curl -X POST http://localhost:5000/api/auth/send-email-verification -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
curl -X POST http://localhost:5000/api/auth/send-phone-code -H "Content-Type: application/json" -d '{"phone":"+911234567890"}'
```

Notes

- In production, you should send the email `token` via email and `code` via SMS instead of returning them in responses.
- You may choose to block login until email/phone are verified (current flow returns verification flags in login response).
