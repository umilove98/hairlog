export type Category = 'hair' | 'skin';

export const CATEGORY_LABEL: Record<Category, string> = {
  hair: '머리',
  skin: '피부',
};

export interface Person {
  id: string;
  name: string;
  createdAt: string;
}

export interface TreatmentType {
  id: string;
  name: string;
  category: Category;
  defaultUnit?: string;
  archived?: boolean;
}

export interface RecordItem {
  treatmentTypeId: string;
  amount?: number;
  unit?: string;
  note?: string;
}

export interface TreatmentRecord {
  id: string;
  personId: string;
  date: string;
  items: RecordItem[];
  memo?: string;
  createdAt: string;
}

export interface DataFile {
  people: Person[];
  treatmentTypes: TreatmentType[];
  records: TreatmentRecord[];
}

export interface RecordFilters {
  personId?: string;
  category?: Category;
  from?: string;
  to?: string;
}
