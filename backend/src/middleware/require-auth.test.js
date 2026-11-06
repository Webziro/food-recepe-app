import test from "node:test";
import assert from "node:assert/strict";

process.env.SUPABASE_URL = "https://supabase.test";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

const { requireAuth } = await import("./require-auth.js");

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("rejects requests without a bearer token", async () => {
  const response = createResponse();
  let continued = false;

  await requireAuth({ get: () => undefined }, response, () => {
    continued = true;
  });

  assert.equal(response.statusCode, 401);
  assert.equal(continued, false);
});

test("rejects tokens Supabase does not validate", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => ({ ok: false });

  const response = createResponse();
  let continued = false;
  await requireAuth({ get: () => "Bearer invalid" }, response, () => {
    continued = true;
  });

  assert.equal(response.statusCode, 401);
  assert.equal(continued, false);
});

test("attaches the Supabase-verified user to the request", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ id: "verified-user" }) });

  const response = createResponse();
  const request = { get: () => "Bearer valid" };
  let continued = false;
  await requireAuth(request, response, () => {
    continued = true;
  });

  assert.equal(continued, true);
  assert.equal(request.authUser.id, "verified-user");
});