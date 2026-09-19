/**
 * Repository interface for shop record data access.
 *
 * Contract (unimplemented): concrete repositories should provide
 * implementations backed by localStorage, Supabase, or another store.
 * Consumers depend on this interface so the backing store can be swapped
 * without changing business logic.
 *
 * - getAll(collection)      → entire collection
 * - getById(collection, id) → single record or null
 * - insert(collection, record) → stored record
 * - update(collection, id, fields) → updated record
 * - query(collection, predicate) → filtered records
 */
"use client";

// TODO: SupabaseRepository goes here — select between localStorageRepository
// (local/demo mode) and SupabaseRepository (hosted mode) via a factory, e.g.
// `getRepository()` returning isSupabaseConfigured ? supabaseRepository : localStorageRepository.

export const repository = {
  getAll(collection) {
    throw new Error(`Repository.getAll not implemented (${collection})`);
  },

  getById(collection, id) {
    throw new Error(`Repository.getById not implemented (${collection}, ${id})`);
  },

  insert(collection, record) {
    throw new Error(`Repository.insert not implemented (${collection})`);
  },

  update(collection, id, fields) {
    throw new Error(`Repository.update not implemented (${collection}, ${id})`);
  },

  query(collection, predicate) {
    throw new Error(`Repository.query not implemented (${collection})`);
  },
};

export default repository;