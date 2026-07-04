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
  notes: string;
  photoUrl: string | null;
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
    'Medical Notes'?: string;
    Photos?: { url: string }[];
  };
}

function recordToCat(record: AirtableRecord): Cat {
  const f = record.fields;
  return {
    id: record.id,
    name: f.Name ?? 'Unnamed',
    breed: f.Breed ?? '',
    sex: f.Sex ?? '',
    age: f.Age ?? '',
    status: f.Status ?? '',
    intakeDate: f['Intake Date'] ?? '',
    notes: f['Medical Notes'] ?? '',
    photoUrl: f.Photos?.[0]?.url ?? null,
  };
}

async function fetchCats(): Promise<Cat[]> {
  const token = getSecret('AIRTABLE_TOKEN');
  if (!token) {
    console.warn('AIRTABLE_TOKEN is not set; returning no cats.');
    return [];
  }

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
