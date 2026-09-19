/**
 * localStorage-backed repository implementing the repository interface
 * in ./repository.js. Persists the full shop record book under
 * "shop_record_book_data_v1" and seeds it from src/lib/supabase.js on
 * first read (when nothing is stored yet).
 */
"use client";

import { STORAGE_KEY, initialData } from '../lib/supabase.js';

const read = () => {
  if (typeof window === 'undefined') return initialData;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local shop data:', e);
    return initialData;
  }
};

const write = (data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const localStorageRepository = {
  // Read the full record book (seeds it first if nothing is stored yet).
  getBook() {
    return read();
  },

  getAll(collection) {
    return read()[collection] || [];
  },

  getById(collection, id) {
    const record = (read()[collection] || []).find((r) => r.id === id);
    return record ?? null;
  },

  insert(collection, record) {
    const data = read();
    data[collection] = [record, ...(data[collection] || [])];
    write(data);
    return record;
  },

  update(collection, id, fields) {
    const data = read();
    const updated = { ...data[collection].find((r) => r.id === id), ...fields };
    data[collection] = data[collection].map((r) =>
      r.id === id ? updated : r,
    );
    write(data);
    return updated;
  },

  query(collection, predicate) {
    return (read()[collection] || []).filter(predicate);
  },
};

export default localStorageRepository;