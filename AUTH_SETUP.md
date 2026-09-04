# Auth Session Secret Setup

This app signs session JWTs using `SESSION_SECRET`.

## Behavior

- **Production**: requires `SESSION_SECRET` to be set and at least 32 chars.
- **Development**: falls back to a local dev secret when env var is missing, so login flow keeps working during setup.

## Recommended Local Config

Add this to `.env.local`:

```env
SESSION_SECRET=replace-with-a-random-string-at-least-32-characters
```

PowerShell example to generate one:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Google Sign-In

Create a Web application OAuth client in Google Cloud Console, then configure:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
# Optional; only needed when the public origin cannot be inferred from requests:
GOOGLE_REDIRECT_URI=https://your-production-domain.example/api/auth/google/callback
```

In the client's **Authorized redirect URIs**, add your live site origin followed by
`/api/auth/google/callback` (for example,
`https://your-production-domain.example/api/auth/google/callback`). For local
development, also authorize `http://localhost:3000/api/auth/google/callback`.
