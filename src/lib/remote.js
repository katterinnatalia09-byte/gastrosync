import { createClient } from '@supabase/supabase-js';

// La clave "publishable" es pública por diseño (se puede ver en el navegador).
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://abeuiqmsyjfscomivufo.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sbpG2JPJygApW58oCJMDGQ_QfMmqRRQ';

export const supabase = createClient(URL, KEY);

const TABLE = 'gs_records';
export const SEED_MARKER = '__seeded__';

// Trae todos los registros de una colección (orders, users, products...), del más viejo al más nuevo
export async function fetchCollection(collection) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id,data')
    .eq('collection', collection)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .range(0, 4999);
  if (error) throw error;
  return data || [];
}

export async function upsertRows(rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'collection,id' });
  if (error) throw error;
}

export async function deleteRows(collection, ids) {
  if (!ids.length) return;
  const { error } = await supabase.from(TABLE).delete().eq('collection', collection).in('id', ids);
  if (error) throw error;
}

// Un solo canal en tiempo real para toda la tabla; cada colección registra su manejador.
const handlers = new Map();
let channel = null;

export function subscribe(collection, fn) {
  if (!channel) {
    channel = supabase
      .channel('gs-records')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, (payload) => {
        const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
        const set = handlers.get(row?.collection);
        if (set) set.forEach(f => f(payload.eventType, payload.new, payload.old));
      })
      .subscribe();
  }
  if (!handlers.has(collection)) handlers.set(collection, new Set());
  handlers.get(collection).add(fn);
  return () => handlers.get(collection)?.delete(fn);
}
