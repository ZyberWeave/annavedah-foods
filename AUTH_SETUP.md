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
