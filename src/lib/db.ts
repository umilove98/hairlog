import { promises as fs } from 'fs';
import path from 'path';
import { newId } from './id';
import type {
  Category,
  DataFile,
  Person,
  RecordFilters,
  RecordItem,
  TreatmentRecord,
  TreatmentType,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

const EMPTY: DataFile = { people: [], treatmentTypes: [], records: [] };

async function readAll(): Promise<DataFile> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DataFile>;
    return {
      people: parsed.people ?? [],
      treatmentTypes: parsed.treatmentTypes ?? [],
      records: parsed.records ?? [],
    };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await writeAll(EMPTY);
      return { ...EMPTY };
    }
    throw err;
  }
}

async function writeAll(data: DataFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── People ─────────────────────────────────────────────────────────

export async function listPeople(): Promise<Person[]> {
  const data = await readAll();
  return [...data.people].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getPerson(id: string): Promise<Person | null> {
  const data = await readAll();
  return data.people.find((p) => p.id === id) ?? null;
}

export async function createPerson(input: { name: string }): Promise<Person> {
  const data = await readAll();
  const person: Person = {
    id: newId(),
    name: input.name.trim(),
    createdAt: new Date().toISOString(),
  };
  data.people.push(person);
  await writeAll(data);
  return person;
}

export async function updatePerson(
  id: string,
  patch: Partial<Pick<Person, 'name'>>
): Promise<Person> {
  const data = await readAll();
  const idx = data.people.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Person not found');
  data.people[idx] = { ...data.people[idx], ...patch };
  await writeAll(data);
  return data.people[idx];
}

export async function deletePerson(id: string): Promise<void> {
  const data = await readAll();
  data.people = data.people.filter((p) => p.id !== id);
  data.records = data.records.filter((r) => r.personId !== id);
  await writeAll(data);
}

// ── Treatment types ────────────────────────────────────────────────

export async function listTreatmentTypes(opts?: {
  includeArchived?: boolean;
}): Promise<TreatmentType[]> {
  const data = await readAll();
  const list = opts?.includeArchived
    ? data.treatmentTypes
    : data.treatmentTypes.filter((t) => !t.archived);
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export async function createTreatmentType(
  input: Omit<TreatmentType, 'id'>
): Promise<TreatmentType> {
  const data = await readAll();
  const t: TreatmentType = {
    id: newId(),
    name: input.name.trim(),
    category: input.category,
    defaultUnit: input.defaultUnit?.trim() || undefined,
    archived: input.archived ?? false,
  };
  data.treatmentTypes.push(t);
  await writeAll(data);
  return t;
}

export async function updateTreatmentType(
  id: string,
  patch: Partial<Omit<TreatmentType, 'id'>>
): Promise<TreatmentType> {
  const data = await readAll();
  const idx = data.treatmentTypes.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('TreatmentType not found');
  data.treatmentTypes[idx] = { ...data.treatmentTypes[idx], ...patch };
  await writeAll(data);
  return data.treatmentTypes[idx];
}

export async function deleteTreatmentType(id: string): Promise<void> {
  const data = await readAll();
  data.treatmentTypes = data.treatmentTypes.filter((t) => t.id !== id);
  // 기록 내 해당 아이템도 제거 (해당 아이템만 빠진 기록은 유지)
  data.records = data.records.map((r) => ({
    ...r,
    items: r.items.filter((i) => i.treatmentTypeId !== id),
  }));
  await writeAll(data);
}

// ── Records ────────────────────────────────────────────────────────

export async function listRecords(
  filters?: RecordFilters
): Promise<TreatmentRecord[]> {
  const data = await readAll();
  let records = [...data.records];

  if (filters?.personId) {
    records = records.filter((r) => r.personId === filters.personId);
  }
  if (filters?.from) {
    records = records.filter((r) => r.date >= filters.from!);
  }
  if (filters?.to) {
    records = records.filter((r) => r.date <= filters.to!);
  }
  if (filters?.category) {
    const typeIds = new Set(
      data.treatmentTypes
        .filter((t) => t.category === filters.category)
        .map((t) => t.id)
    );
    records = records.filter((r) =>
      r.items.some((i) => typeIds.has(i.treatmentTypeId))
    );
  }

  return records.sort((a, b) =>
    b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );
}

export async function getRecord(id: string): Promise<TreatmentRecord | null> {
  const data = await readAll();
  return data.records.find((r) => r.id === id) ?? null;
}

export async function createRecord(
  input: Omit<TreatmentRecord, 'id' | 'createdAt'>
): Promise<TreatmentRecord> {
  const data = await readAll();
  const record: TreatmentRecord = {
    ...input,
    id: newId(),
    createdAt: new Date().toISOString(),
    items: input.items.map(sanitizeItem),
  };
  data.records.push(record);
  await writeAll(data);
  return record;
}

export async function updateRecord(
  id: string,
  patch: Partial<Omit<TreatmentRecord, 'id' | 'createdAt'>>
): Promise<TreatmentRecord> {
  const data = await readAll();
  const idx = data.records.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Record not found');
  const next: TreatmentRecord = {
    ...data.records[idx],
    ...patch,
    items: patch.items ? patch.items.map(sanitizeItem) : data.records[idx].items,
  };
  data.records[idx] = next;
  await writeAll(data);
  return next;
}

export async function deleteRecord(id: string): Promise<void> {
  const data = await readAll();
  data.records = data.records.filter((r) => r.id !== id);
  await writeAll(data);
}

function sanitizeItem(i: RecordItem): RecordItem {
  return {
    treatmentTypeId: i.treatmentTypeId,
    amount: typeof i.amount === 'number' && !Number.isNaN(i.amount) ? i.amount : undefined,
    unit: i.unit?.trim() || undefined,
    note: i.note?.trim() || undefined,
  };
}

// ── Export / Import ────────────────────────────────────────────────

export async function exportAll(): Promise<DataFile> {
  return await readAll();
}

export async function importAll(payload: DataFile): Promise<void> {
  if (
    !payload ||
    !Array.isArray(payload.people) ||
    !Array.isArray(payload.treatmentTypes) ||
    !Array.isArray(payload.records)
  ) {
    throw new Error('Invalid data file');
  }
  await writeAll(payload);
}

// ── Helpers (서버 컴포넌트에서 함께 쓰기 편하게) ────────────────────

export async function getAllForRender(): Promise<DataFile> {
  return await readAll();
}

export function categoryOfRecord(
  record: TreatmentRecord,
  types: TreatmentType[]
): Set<Category> {
  const out = new Set<Category>();
  for (const item of record.items) {
    const t = types.find((tt) => tt.id === item.treatmentTypeId);
    if (t) out.add(t.category);
  }
  return out;
}
