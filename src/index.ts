import { Hono } from 'hono';
import { verifyMediaSignature } from './utils/media-signatures';

type Env = {
  R2: R2Bucket;
  R2_MEDIA_SIGNING_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/media/:key', async c => {
  const encodedKey = c.req.param('key');
  const key = decodeURIComponent(encodedKey);
  const expires = c.req.query('expires');
  const sig = c.req.query('sig');

  if (!expires || !sig) return c.text('Missing signature', 400);

  const now = Math.floor(Date.now() / 1000);
  if (now > Number(expires)) return c.text('URL expired', 403);

  const ok = await verifyMediaSignature(
    c.env.R2_MEDIA_SIGNING_SECRET,
    key,
    Number(expires),
    sig
  );

  if (!ok) return c.text('Invalid signature', 403);

  const obj = await c.env.R2.get(key);
  if (!obj) return c.text('Not found', 404);

  const headers = new Headers();
  if (obj.httpMetadata?.contentType)
    headers.set('Content-Type', obj.httpMetadata.contentType);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(obj.body, { headers });
});

export default app;
