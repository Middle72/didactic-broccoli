const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;
const TABLE_ID = import.meta.env.AIRTABLE_CATS_TABLE_ID;
const TOKEN = import.meta.env.AIRTABLE_TOKEN;

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
  if (!BASE_ID || !TABLE_ID || !TOKEN) {
    console.warn('Airtable env vars are not set (AIRTABLE_BASE_ID, AIRTABLE_CATS_TABLE_ID, AIRTABLE_TOKEN); returning no cats.');
    return [];
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
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
