/**
 * Seeds the matching demo: six caregivers, one admin, nothing else.
 *
 *   pnpm seed:demo
 *
 * Why this exists, and why it is separate from `seed-caregivers.mjs`:
 *
 * `seed-caregivers.mjs` makes a crowd, so the admin list has a row in every
 * state. This one makes a *table*: the six caregivers are built against the
 * household in `demo/01-family-account.md`, so that a parent who types that
 * household in by hand sees one Great fit, one Good fit and one Partial fit —
 * and three caregivers who must never appear, one for each hard rule.
 *
 *   demo-great      covers all four facts, all eight hours, female   → Great
 *   demo-good       covers all four facts, all eight hours, male     → Good
 *   demo-partial    misses one need, six of eight hours              → Partial
 *   demo-miss       shares none of the household's four facts        → never
 *   demo-adults     works with 14–21 year olds, child is 10          → never
 *   demo-unapproved perfect on paper, profile not approved           → never
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and
 * SUPABASE_SECRET_KEY in .env.local. The secret key bypasses RLS, is used only
 * from this script, and never reaches the app.
 *
 * Clearing: every account at @example.com is deleted first — the old crowd, the
 * previous run of this script, and the admin — so the seed is repeatable and
 * the two scripts are mutually exclusive rather than additive. It does not
 * truncate anything else; real parents and real caregivers are untouched.
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SECRET = process.env.SUPABASE_SECRET_KEY;

if (!URL_BASE || !PUBLISHABLE || !SECRET) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or SUPABASE_SECRET_KEY.",
  );
  process.exit(1);
}

const DOMAIN = "example.com";
const PASSWORD = "SeedPass-2026!";
const ADMIN_EMAIL = `seed-admin@${DOMAIN}`;

/** One retry on a dropped socket, same reason as the other seed. */
const rpc = async (path, init = {}) => {
  const send = () =>
    fetch(`${URL_BASE}${path}`, {
      ...init,
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

  try {
    return await send();
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return send();
  }
};

/** A one-page PDF, so a credential opens to something rather than a 404. */
function buildPdf(text) {
  const stream = `BT /F1 20 Tf 72 700 Td (${text.replace(/[()\\]/g, "\\$&")}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];

  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

const MONDAY = 1;
const THURSDAY = 4;

/**
 * Ages run wide on purpose. Age is derived from the date of birth on every
 * render, so a band that only just covers a ten-year-old stops covering them
 * next year and the demo quietly loses its Great fit.
 */
const FIXTURES = [
  {
    name: "Rosa Alvarez",
    email: `demo-great@${DOMAIN}`,
    gender: "female",
    ageMin: 5,
    ageMax: 14,
    rate: 26,
    needs: ["communication", "big-feelings"],
    supports: ["behaviour", "communication"],
    blocks: [
      [MONDAY, "08:00", "12:00"],
      [THURSDAY, "13:00", "17:00"],
    ],
    languages: ["english", "spanish"],
    bio: "Nine years with non-speaking children, mostly at home. I use AAC every day and let the child set the pace.",
    approve: true,
  },
  {
    name: "Daniel Okafor",
    email: `demo-good@${DOMAIN}`,
    gender: "male",
    ageMin: 6,
    ageMax: 14,
    rate: 30,
    needs: ["communication", "big-feelings"],
    supports: ["behaviour", "communication"],
    blocks: [
      [MONDAY, "08:00", "12:00"],
      [THURSDAY, "13:00", "17:00"],
    ],
    languages: ["english"],
    bio: "Behavioural support worker. I keep notes so families can see what changed and what did not.",
    approve: true,
  },
  {
    name: "Grace Mwangi",
    email: `demo-partial@${DOMAIN}`,
    gender: "female",
    ageMin: 4,
    ageMax: 11,
    rate: 24,
    // Misses "Big feelings or frequent meltdowns" on purpose, and stops at 15:00
    // on Thursday, so this one card carries both kinds of gap.
    needs: ["communication"],
    supports: ["behaviour", "communication"],
    blocks: [
      [MONDAY, "08:00", "12:00"],
      [THURSDAY, "13:00", "15:00"],
    ],
    languages: ["english"],
    bio: "Respite caregiver for five years. I work best with children who need communication support, and I have school pickup from 15:00 on Thursdays.",
    approve: true,
  },
  {
    name: "Peter Njenga",
    email: `demo-miss@${DOMAIN}`,
    gender: "female",
    ageMin: 5,
    ageMax: 14,
    rate: 22,
    needs: ["sensory-sensitivities"],
    supports: ["cooking"],
    blocks: [
      [MONDAY, "08:00", "12:00"],
      [THURSDAY, "13:00", "17:00"],
    ],
    languages: ["english"],
    bio: "Household help and cooking, with sensory-friendly routines in the kitchen.",
    approve: true,
  },
  {
    name: "Linda Park",
    email: `demo-adults@${DOMAIN}`,
    gender: "female",
    ageMin: 14,
    ageMax: 21,
    rate: 28,
    needs: ["communication", "big-feelings"],
    supports: ["behaviour", "communication"],
    blocks: [
      [MONDAY, "08:00", "12:00"],
      [THURSDAY, "13:00", "17:00"],
    ],
    languages: ["english"],
    bio: "Teen and young-adult support. I work on independence and community access.",
    approve: true,
  },
  {
    name: "Noor Haddad",
    email: `demo-unapproved@${DOMAIN}`,
    gender: "female",
    ageMin: 5,
    ageMax: 14,
    rate: 25,
    needs: ["communication", "big-feelings"],
    supports: ["behaviour", "communication"],
    blocks: [
      [MONDAY, "08:00", "12:00"],
      [THURSDAY, "13:00", "17:00"],
    ],
    languages: ["english"],
    bio: "Submitted, waiting on review: perfect on paper, and invisible until approved.",
    approve: false,
  },
];

const DAY_OFFSET = (day) => Date.now() - day * 86_400_000;
const iso = (ms) => new Date(ms).toISOString();

async function listUsers() {
  const users = [];

  for (let page = 1; ; page += 1) {
    const response = await rpc(`/auth/v1/admin/users?page=${page}&per_page=200`);
    if (!response.ok) throw new Error(`list users: ${response.status}`);
    const body = await response.json();
    const batch = body.users ?? [];
    users.push(...batch);
    if (batch.length < 200) break;
  }

  return users;
}

async function createUser(email) {
  const response = await rpc("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD, email_confirm: true }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`create ${email}: ${response.status} ${JSON.stringify(body)}`);
  }

  return body.id;
}

async function insert(table, rows) {
  const response = await rpc(`/rest/v1/${table}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    throw new Error(`${table}: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function uploadDocument(userId, name, kind, label) {
  const path = `${userId}/${kind}.pdf`;
  const pdf = buildPdf(`${label} - ${name}`);

  const response = await fetch(
    `${URL_BASE}/storage/v1/object/caregiver-documents/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/pdf",
        "x-upsert": "true",
      },
      body: pdf,
    },
  );

  if (!response.ok) {
    throw new Error(`upload ${path}: ${response.status} ${await response.text()}`);
  }

  return path;
}

async function main() {
  console.log("Clearing every @example.com account…");

  const existing = (await listUsers()).filter(
    (user) => typeof user.email === "string" && user.email.endsWith(`@${DOMAIN}`),
  );

  for (const user of existing) {
    const listed = await fetch(
      `${URL_BASE}/storage/v1/object/list/caregiver-documents`,
      {
        method: "POST",
        headers: {
          apikey: SECRET,
          Authorization: `Bearer ${SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefix: user.id, limit: 100 }),
      },
    );

    if (listed.ok) {
      for (const file of await listed.json()) {
        await fetch(
          `${URL_BASE}/storage/v1/object/caregiver-documents/${user.id}/${file.name}`,
          { method: "DELETE", headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` } },
        );
      }
    }

    await rpc(`/auth/v1/admin/users/${user.id}`, { method: "DELETE" });
  }

  console.log(`  removed ${existing.length} account(s).`);

  const adminId = await createUser(ADMIN_EMAIL);
  await insert("admins", [{ user_id: adminId }]);
  console.log(`Created ${ADMIN_EMAIL} (password ${PASSWORD}).`);

  const needIds = new Map(
    (await (await rpc("/rest/v1/needs?select=id,slug")).json()).map((row) => [row.slug, row.id]),
  );
  const supportIds = new Map(
    (await (await rpc("/rest/v1/supports?select=id,slug")).json()).map((row) => [
      row.slug,
      row.id,
    ]),
  );

  for (const [index, fixture] of FIXTURES.entries()) {
    const userId = await createUser(fixture.email);
    const created = DAY_OFFSET(40 - index);
    const submitted = DAY_OFFSET(20 - index);
    const approved = DAY_OFFSET(10 - index);

    await insert("caregivers", [
      {
        user_id: userId,
        display_name: fixture.name,
        bio: fixture.bio,
        date_of_birth: "1995-04-12",
        gender: fixture.gender,
        age_min: fixture.ageMin,
        age_max: fixture.ageMax,
        hourly_rate: fixture.rate,
        languages: fixture.languages,
        counties: ["contra_costa"],
        legal_name: fixture.name,
        address_street: "1 Demo Street",
        address_city: "Concord",
        address_postal_code: "94520",
        referral_source: "Friend",
        conditions: ["autism", "adhd"],
        why_special_needs:
          "I have looked after children with high support needs for years, and the work suits me.",
        difficult_moment:
          "A child escalated in a car park. I lowered my voice, gave space, and waited it out.",
        background_check_agreed: true,
        signature_name: fixture.name,
        signed_at: iso(submitted),
        signed_statement_version: "2026-10-v1",
        submitted_at: iso(submitted),
        created_at: iso(created),
        approved_at: fixture.approve ? iso(approved) : null,
        declined_at: null,
      },
    ]);

    await insert(
      "caregiver_needs",
      fixture.needs.map((slug) => ({ caregiver_id: userId, need_id: needIds.get(slug) })),
    );

    await insert(
      "caregiver_supports",
      fixture.supports.map((slug) => ({
        caregiver_id: userId,
        support_id: supportIds.get(slug),
      })),
    );

    await insert(
      "caregiver_availability",
      fixture.blocks.map(([day, start, end]) => ({
        caregiver_id: userId,
        day_of_week: day,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
      })),
    );

    await insert("contacts", [
      {
        user_id: userId,
        label: "Mobile",
        phone: `(925) 555-01${String(10 + index)}`,
        email: fixture.email,
        preferred_contact_method: "text",
      },
    ]);

    if (fixture.approve) {
      for (const kind of ["background_check", "cpr"]) {
        const path = await uploadDocument(userId, fixture.name, kind, "Demo document");
        const [document] = await insert("caregiver_documents", [
          {
            caregiver_id: userId,
            kind,
            storage_path: path,
            file_name: `${kind.replace(/_/g, "-")}.pdf`,
            review_status: "approved",
            reviewed_by: adminId,
            reviewed_at: iso(approved),
          },
        ]);

        if (!document?.id) throw new Error(`document ${fixture.email}`);
      }
    }

    console.log(
      `  ${fixture.approve ? "approved" : "pending "}  ${fixture.name.padEnd(14)} ${fixture.email}`,
    );
  }

  console.log("\nDone. Six caregivers, one admin.");
  console.log("Parent accounts are not seeded: the demo creates one and types the household in.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
