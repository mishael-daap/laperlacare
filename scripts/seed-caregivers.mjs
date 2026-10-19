/**
 * Seeds 20 test caregivers and one test admin.
 *
 *   pnpm seed:caregivers
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and
 * SUPABASE_SECRET_KEY in .env.local. The secret key bypasses RLS, is used only
 * from this script, and never reaches the app.
 *
 * Every seeded account is @example.com and every password is the same, because
 * this is data to click through, not data to keep. Re-running the script deletes
 * the previous seed users — cascading their caregiver rows, contacts, and
 * availability — and creates them again, so it is safe to run twice.
 *
 * What it creates: 6 approved, 6 pending, 4 rejected, 4 still onboarding. Each
 * one has a background check uploaded (except the onboarding ones, who have not
 * submitted one), contact details, and weekly availability. A couple are
 * deliberately incomplete so the "Onboarding" bucket and the "No name yet" row
 * have something in them.
 *
 * Test sign-ins:
 *   seed-admin@example.com        SeedPass-2026!
 *   seed-caregiver-01@example.com SeedPass-2026!   (approved)
 *   seed-caregiver-07@example.com SeedPass-2026!   (pending)
 *   seed-caregiver-17@example.com SeedPass-2026!   (onboarding)
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SECRET = process.env.SUPABASE_SECRET_KEY;

if (!URL_BASE || !PUBLISHABLE || !SECRET) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or SUPABASE_SECRET_KEY in .env.local.",
  );
  process.exit(1);
}

const PASSWORD = "SeedPass-2026!";
const DOMAIN = "example.com";
const ADMIN_EMAIL = `seed-admin@${DOMAIN}`;
const MARKER = "seed-caregiver-";

const rpc = (path, init = {}) =>
  fetch(`${URL_BASE}${path}`, {
    ...init,
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

/** A one-page PDF, so opening a document shows something rather than a 404. */
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

const daysAgo = (days) => new Date(Date.now() - days * 86_400_000).toISOString();

const PEOPLE = [
  {
    name: "Marisol Vega",
    status: "approved",
    city: "Concord",
    address: "1284 Clayton Rd",
    bio: "Eight years supporting autistic children and their families, mostly at home. I keep routines predictable and let the child set the pace.",
    blocks: [[1, "08:00", "14:00"], [3, "08:00", "14:00"], [5, "09:00", "13:00"]],
  },
  {
    name: "Tanya Brooks",
    status: "approved",
    city: "Walnut Creek",
    address: "44 North Main St",
    bio: "Special education teacher for eleven years. Comfortable with IEP goals, sensory breaks, and the quiet start some mornings need.",
    blocks: [[2, "15:00", "19:00"], [4, "15:00", "19:00"]],
  },
  {
    name: "Daniel Okafor",
    status: "approved",
    city: "Richmond",
    address: "918 Cutting Blvd",
    bio: "Behavioural support worker. I focus on daily living skills and communication, and I keep notes so families know what changed.",
    blocks: [[1, "07:30", "12:30"], [2, "07:30", "12:30"], [4, "07:30", "12:30"]],
  },
  {
    name: "Priya Raman",
    status: "approved",
    city: "San Ramon",
    address: "210 Market Pl",
    bio: "Speech-language assistant. I use visual schedules and lots of repetition, and I am happy to coordinate with a therapist.",
    blocks: [[3, "14:00", "18:00"], [5, "14:00", "18:00"]],
  },
  {
    name: "Alicia Moreno",
    status: "approved",
    city: "Antioch",
    address: "77 G St",
    bio: "Respite caregiver for six years, including weekends and school holidays. I cook, drive to activities, and stay calm when plans change.",
    blocks: [[6, "10:00", "18:00"], [7, "10:00", "16:00"]],
  },
  {
    name: "Jordan Ellis",
    status: "approved",
    city: "Pleasant Hill",
    address: "5 Contra Costa Blvd",
    bio: "Pediatric home care aide. Experience with feeding routines, transfers, and keeping a house running while a parent rests.",
    blocks: [[1, "16:00", "21:00"], [3, "16:00", "21:00"], [5, "16:00", "21:00"]],
  },
  {
    name: "Naomi Chen",
    status: "pending",
    city: "Martinez",
    address: "630 Court St",
    bio: "Two years with preschool-aged children, one of them autistic. Looking for regular weekday hours.",
    blocks: [[2, "09:00", "13:00"], [4, "09:00", "13:00"]],
  },
  {
    name: "Marcus Webb",
    status: "pending",
    city: "Pittsburg",
    address: "12 Railroad Ave",
    bio: "Former youth sports coach. I do after-school care for active kids and am comfortable with big feelings.",
    blocks: [[1, "15:00", "19:00"], [3, "15:00", "19:00"]],
  },
  {
    name: "Sofia Delgado",
    status: "pending",
    city: "Brentwood",
    address: "880 Second St",
    bio: "Bilingual Spanish and English. I have cared for children with Down syndrome and speech delays.",
    blocks: [[2, "08:00", "15:00"], [5, "08:00", "15:00"]],
  },
  {
    name: "Ethan Park",
    status: "pending",
    city: "Danville",
    address: "31 Hartz Ave",
    bio: "Occupational therapy student. I like building routines around sensory needs.",
    blocks: [[4, "13:00", "18:00"]],
  },
  {
    name: "Layla Hassan",
    status: "pending",
    city: "Lafayette",
    address: "9 Mt Diablo Blvd",
    bio: "Ten years of nannying, four with a non-speaking child who uses an AAC device.",
    blocks: [[1, "09:00", "17:00"], [2, "09:00", "17:00"], [3, "09:00", "17:00"]],
  },
  {
    name: "Grace Kim",
    status: "pending",
    city: "Clayton",
    address: "56 Main St",
    bio: "Special-needs sibling and longtime babysitter. New to professional caregiving and quick to learn.",
    blocks: [[6, "09:00", "15:00"]],
  },
  {
    name: "Brian Cole",
    status: "rejected",
    city: "Oakley",
    address: "3 Laurel Rd",
    bio: "Weekend caregiver, happy to travel.",
    blocks: [[7, "08:00", "14:00"]],
  },
  {
    name: "Renee Foster",
    status: "rejected",
    city: "El Cerrito",
    address: "112 San Pablo Ave",
    bio: "Fifteen years in childcare, most recently as a nanny.",
    blocks: [[2, "10:00", "16:00"]],
  },
  {
    name: "Victor Salas",
    status: "rejected",
    city: "Hercules",
    address: "40 Sycamore Ave",
    bio: "Looking for evening and overnight work.",
    blocks: [[1, "18:00", "22:00"]],
  },
  {
    name: "Dana Whitfield",
    status: "rejected",
    city: "Pinole",
    address: "701 Tennent Ave",
    bio: "Experience with teenagers on the spectrum.",
    blocks: [[3, "12:00", "18:00"]],
  },
  {
    name: "Omar Haddad",
    status: "onboarding",
    city: "Concord",
    address: "90 Willow Pass Rd",
    bio: "New to the network. Still putting my profile together.",
    blocks: [],
  },
  {
    // No name, no bio, no contacts: the row the list has to be honest about.
    name: null,
    status: "onboarding",
    city: null,
    address: null,
    bio: null,
    blocks: [],
  },
  {
    name: "Tyler Nguyen",
    status: "onboarding",
    city: "Moraga",
    address: "7 Moraga Way",
    bio: null,
    blocks: [],
  },
  {
    name: "Bianca Rossi",
    status: "onboarding",
    city: "Orinda",
    address: "22 Village Sq",
    bio: "Respite care on weekends.",
    blocks: [],
  },
];

const pad = (number) => String(number).padStart(2, "0");
const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, ".");

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

async function uploadDocument(userId, name, index) {
  const path = `${userId}/background-check-seed.pdf`;
  const pdf = buildPdf(`Background check - ${name ?? "Seed caregiver"} (${pad(index + 1)})`);

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
  console.log("Removing any previous seed users…");
  const existing = (await listUsers()).filter(
    (user) =>
      user.email === ADMIN_EMAIL ||
      (typeof user.email === "string" && user.email.startsWith(MARKER)),
  );

  for (const user of existing) {
    for (const path of [`${user.id}/background-check-seed.pdf`]) {
      await fetch(`${URL_BASE}/storage/v1/object/caregiver-documents/${path}`, {
        method: "DELETE",
        headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
      });
    }

    await rpc(`/auth/v1/admin/users/${user.id}`, { method: "DELETE" });
  }

  console.log(`Removed ${existing.length} seed user(s).`);

  const adminId = await createUser(ADMIN_EMAIL);
  await rpc("/rest/v1/admins", {
    method: "POST",
    body: JSON.stringify({ user_id: adminId }),
  });

  console.log(`Created ${ADMIN_EMAIL}.`);

  for (const [index, person] of PEOPLE.entries()) {
    const email = `${MARKER}${pad(index + 1)}@${DOMAIN}`;
    const userId = await createUser(email);

    const createdAt = daysAgo(30 - index);
    const submittedAt =
      person.status === "onboarding" ? null : daysAgo(Math.max(1, 20 - index));

    // Insert as pending first: a background check insert resets the status to
    // pending by trigger, so the final status is written after the document.
    const inserted = await rpc("/rest/v1/caregivers", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: userId,
        display_name: person.name,
        bio: person.bio,
        verification_status: "pending",
        created_at: createdAt,
      }),
    });

    if (!inserted.ok) {
      throw new Error(`caregiver ${email}: ${inserted.status} ${await inserted.text()}`);
    }

    if (person.status !== "onboarding") {
      const path = await uploadDocument(userId, person.name, index);

      await rpc("/rest/v1/caregiver_documents", {
        method: "POST",
        body: JSON.stringify({
          caregiver_id: userId,
          kind: "background_check",
          storage_path: path,
          file_name: `${(person.name ?? "seed-caregiver").toLowerCase().replace(/\s+/g, "-")}-background-check.pdf`,
          created_at: submittedAt,
        }),
      });
    }

    if (person.city) {
      await rpc("/rest/v1/contacts", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          label: "Mobile",
          phone: `(925) 555-${String(101 + index).padStart(4, "0")}`,
          email: `${slug(person.name)}@${DOMAIN}`,
          address: `${person.address}, ${person.city}, CA`,
        }),
      });
    }

    if (person.blocks.length > 0) {
      await rpc("/rest/v1/caregiver_availability", {
        method: "POST",
        body: JSON.stringify(
          person.blocks.map(([day, start, end]) => ({
            caregiver_id: userId,
            day_of_week: day,
            start_time: `${start}:00`,
            end_time: `${end}:00`,
          })),
        ),
      });
    }

    const reviewed = person.status === "approved" || person.status === "rejected";

    await rpc(`/rest/v1/caregivers?user_id=eq.${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        verification_status: person.status === "onboarding" ? "pending" : person.status,
        submitted_at: submittedAt,
        reviewed_by: reviewed ? adminId : null,
        reviewed_at: reviewed ? daysAgo(Math.max(1, 12 - index)) : null,
      }),
    });

    console.log(
      `  ${pad(index + 1)}  ${person.status.padEnd(10)} ${(person.name ?? "(no name)").padEnd(16)} ${email}`,
    );
  }

  // Read the seeded data back through the same admin path the app uses.
  const tokenResponse = await fetch(
    `${URL_BASE}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: PUBLISHABLE, "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: PASSWORD }),
    },
  );

  const token = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(`seed admin sign-in: ${tokenResponse.status} ${JSON.stringify(token)}`);
  }

  const asAdmin = (path, init = {}) =>
    fetch(`${URL_BASE}${path}`, {
      ...init,
      headers: {
        apikey: PUBLISHABLE,
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

  const counts = await (await asAdmin("/rest/v1/rpc/admin_caregiver_counts", { method: "POST", body: "{}" })).json();
  const directory = await (
    await asAdmin("/rest/v1/rpc/admin_caregiver_directory", {
      method: "POST",
      body: JSON.stringify({ p_status: "all", p_limit: 100, p_offset: 0 }),
    })
  ).json();

  console.log("\nSeeded through the admin directory function:");
  console.log(counts[0]);
  console.log(`directory rows returned: ${directory.length}`);

  console.log("\nSign in with:");
  console.log(`  ${ADMIN_EMAIL} / ${PASSWORD}`);
  console.log(`  ${MARKER}01@${DOMAIN} / ${PASSWORD}  (approved)`);
  console.log(`  ${MARKER}07@${DOMAIN} / ${PASSWORD}  (pending)`);
  console.log(`  ${MARKER}17@${DOMAIN} / ${PASSWORD}  (onboarding)`);
}

await main();
