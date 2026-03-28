import { supabase } from "./supabase";
import { Pool, PoolHost, PoolSettings, Prediction } from "./types";
import { generateSlug } from "./constants";
import { nanoid } from "nanoid";

export async function createPool(params: {
  babyName: string;
  dueDate: string;
  hostDisplayName: string;
  enabledCategories: string[];
  userId: string;
}): Promise<Pool> {
  const slug = generateSlug(params.babyName);
  const shareCode = nanoid(6);

  const { data: pool, error: poolError } = await supabase
    .from("bb_pools")
    .insert({
      slug,
      baby_name: params.babyName,
      due_date: params.dueDate,
      host_display_name: params.hostDisplayName,
      enabled_categories: params.enabledCategories,
      share_code: shareCode,
    })
    .select()
    .single();

  if (poolError) {
    if (poolError.code === "23505" && poolError.message.includes("slug")) {
      const retrySlug = `${slug}-${nanoid(4)}`;
      const { data: retryPool, error: retryError } = await supabase
        .from("bb_pools")
        .insert({
          slug: retrySlug,
          baby_name: params.babyName,
          due_date: params.dueDate,
          host_display_name: params.hostDisplayName,
          enabled_categories: params.enabledCategories,
          share_code: shareCode,
        })
        .select()
        .single();
      if (retryError) throw retryError;
      await addPoolHost(retryPool.id, params.userId, "creator");
      return retryPool as Pool;
    }
    throw poolError;
  }

  await addPoolHost(pool.id, params.userId, "creator");
  return pool as Pool;
}

async function addPoolHost(poolId: string, userId: string, role: "creator" | "co-parent") {
  const { error } = await supabase.from("bb_pool_hosts").insert({
    pool_id: poolId,
    user_id: userId,
    role,
    accepted_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getMyPools(userId: string): Promise<Pool[]> {
  const { data: hostEntries, error: hostError } = await supabase
    .from("bb_pool_hosts")
    .select("pool_id")
    .eq("user_id", userId);

  if (hostError) throw hostError;
  if (!hostEntries || hostEntries.length === 0) return [];

  const poolIds = hostEntries.map((h) => h.pool_id);

  const { data: pools, error: poolError } = await supabase
    .from("bb_pools")
    .select("*")
    .in("id", poolIds)
    .order("created_at", { ascending: false });

  if (poolError) throw poolError;
  return (pools ?? []) as Pool[];
}

export async function getPool(poolId: string): Promise<Pool | null> {
  const { data, error } = await supabase
    .from("bb_pools")
    .select("*")
    .eq("id", poolId)
    .single();

  if (error) return null;
  return data as Pool;
}

export async function getPoolBySlug(slug: string): Promise<Pool | null> {
  const { data, error } = await supabase
    .from("bb_pools")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Pool;
}

export async function getPoolPredictionCount(poolId: string): Promise<number> {
  const { count, error } = await supabase
    .from("bb_predictions")
    .select("*", { count: "exact", head: true })
    .eq("pool_id", poolId);

  if (error) return 0;
  return count ?? 0;
}

export async function updatePool(poolId: string, updates: Partial<Pool>): Promise<void> {
  const { error } = await supabase
    .from("bb_pools")
    .update(updates)
    .eq("id", poolId);

  if (error) throw error;
}

export async function deletePool(poolId: string): Promise<void> {
  const { error } = await supabase
    .from("bb_pools")
    .delete()
    .eq("id", poolId);

  if (error) throw error;
}

export async function getPoolSettings(poolId: string): Promise<PoolSettings | null> {
  const { data, error } = await supabase
    .from("bb_pool_settings")
    .select("*")
    .eq("pool_id", poolId)
    .single();

  if (error) return null;
  return data as PoolSettings;
}

export async function getPoolPredictions(poolId: string): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("bb_predictions")
    .select("*")
    .eq("pool_id", poolId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Prediction[];
}

export async function getPoolHosts(poolId: string): Promise<PoolHost[]> {
  const { data, error } = await supabase
    .from("bb_pool_hosts")
    .select("*")
    .eq("pool_id", poolId);

  if (error) throw error;
  return (data ?? []) as PoolHost[];
}
