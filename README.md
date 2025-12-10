# Magic Planner Images

A lightweight Cloudflare Worker that serves signed media files from R2 storage with signature verification.

## Purpose

This Worker provides secure, time-limited access to media files stored in Cloudflare R2 buckets. It validates signed URLs before serving content, ensuring that only authorized requests can access media files.

## Features

- **Signature Verification**: Validates signed URLs using SHA-256 HMAC signatures
- **Expiration Checking**: Enforces time-limited access to media files
- **R2 Integration**: Directly serves files from Cloudflare R2 buckets
- **Cache Headers**: Sets appropriate cache headers for optimal CDN performance
- **Content-Type Preservation**: Maintains original content types from R2 metadata

## Architecture

The Worker uses a simple Hono-based API with a single endpoint:

- `GET /media/:key` - Serves a media file after verifying its signature

### URL Format

```
/media/{encodedKey}?expires={timestamp}&sig={signature}
```

Where:
- `encodedKey`: URL-encoded R2 storage key
- `expires`: Unix timestamp when the URL expires
- `sig`: SHA-256 signature (first 32 characters)

## Environment Variables

The Worker requires the following environment variable (set as a secret):

- `R2_MEDIA_SIGNING_SECRET`: Secret key used for generating and verifying signatures

## R2 Bindings

The Worker binds to R2 buckets:
- **Staging**: `magicplanner-staging`
- **Production**: `magicplanner-production`

## Routes

- **Staging**: `images-staging.magicsafari.app/*`
- **Production**: `images.magicsafari.app/*`

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Generate Cloudflare types
npm run cf-typegen

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Signature Generation

Signatures are generated using the same logic in the main Magic Planner application. The signature is computed as:

```
SHA-256(R2_MEDIA_SIGNING_SECRET:storageKey:expiresAt).substring(0, 32)
```

## Security

- All requests must include valid `expires` and `sig` query parameters
- Expired URLs are rejected with a 403 status
- Invalid signatures are rejected with a 403 status
- Missing parameters result in a 400 status

## Deployment

Deployments are handled via GitHub Actions:
- **Staging**: Automatically deploys on push to `main`
- **Production**: Deploys on release publication

## Related Projects

This Worker is part of the Magic Planner ecosystem and works in conjunction with:
- [magicplanner](https://github.com/magicsafari/magicplanner) - Main application that generates signed URLs
