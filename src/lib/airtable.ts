import { getSecret } from 'astro:env/server';

// Not sensitive — fixed identifiers for this project's Airtable base/table.
const BASE_ID = 'apprSgTHj4HbR7IFB';
const TABLE_ID = 'tbl7FbKhHAu7SgIyj';

export interface Cat {
  id: string;
  name: string;
  breed: string;
  sex: string;
  age: string;
  status: string;
  intakeDate: string;
  spayNeuterDate: string;
  notes: string;
  photoUrl: string | null;
  photos: string[];
}

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Breed?: string;
    Sex?: string;
    Age?: string;
    Status?: string;
    'Intake Date'?: string;
    'Spay/Neuter Date'?: string;
    'Medical Notes'?: string;
    'Photo Main'?: { url: string }[];
    'Photos Details'?: { url: string }[];
  };
}

function recordToCat(record: AirtableRecord): Cat {
  const f = record.fields;
  const mainPhotos = f['Photo Main']?.map((p) => p.url) ?? [];
  const detailPhotos = f['Photos Details']?.map((p) => p.url) ?? [];
  return {
    id: record.id,
    name: f.Name ?? 'Unnamed',
    breed: f.Breed ?? '',
    sex: f.Sex ?? '',
    age: f.Age ?? '',
    status: f.Status ?? '',
    intakeDate: f['Intake Date'] ?? '',
    spayNeuterDate: f['Spay/Neuter Date'] ?? '',
    notes: f['Medical Notes'] ?? '',
    photoUrl: mainPhotos[0] ?? null,
    photos: [...mainPhotos, ...detailPhotos],
  };
}

// Airtable's free plan has a monthly API call cap, and every page view of
// /adoptable, /rehabilitation, or /kitties/[id] would otherwise trigger a
// fresh call. Cache the full cat list for CATS_CACHE_SECONDS via Cloudflare's
// Cache API so concurrent visitors share one Airtable call instead of one each.
const CATS_CACHE_SECONDS = 120;
const CATS_CACHE_KEY = new Request('https://cache.internal.invalid/lucky-penny-kitties-cats');

async function fetchCatsUncached(token: string): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Airtable request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

async function fetchCats(): Promise<Cat[]> {
  const token = getSecret('AIRTABLE_TOKEN');
  if (!token) {
    console.warn('AIRTABLE_TOKEN is not set; returning no cats.');
    return [];
  }

  const cache = caches.default;
  const cached = await cache.match(CATS_CACHE_KEY);
  if (cached) {
    const records: AirtableRecord[] = await cached.json();
    return records.map(recordToCat);
  }

  const records = await fetchCatsUncached(token);

  await cache.put(
    CATS_CACHE_KEY,
    new Response(JSON.stringify(records), {
      headers: {
        'content-type': 'application/json',
        'cache-control': `public, max-age=${CATS_CACHE_SECONDS}`,
      },
    }),
  );

  return records.map(recordToCat);
}

const ADOPTABLE_STATUSES = new Set(['Available', 'Pending', 'In Foster']);
const REHAB_STATUS = 'Medical Hold';

export async function getAdoptableCats(): Promise<Cat[]> {
  const cats = await fetchCats();
  return cats.filter((cat) => ADOPTABLE_STATUSES.has(cat.status));
}

export async function getRehabCats(): Promise<Cat[]> {
  const cats = await fetchCats();
  return cats.filter((cat) => cat.status === REHAB_STATUS);
}

export async function getCatById(id: string): Promise<Cat | null> {
  const cats = await fetchCats();
  return cats.find((cat) => cat.id === id) ?? null;
}
