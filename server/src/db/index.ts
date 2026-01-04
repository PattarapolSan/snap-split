import { Repository } from './repository';
import { MemoryRepository } from './memoryRepository';
import { SupabaseRepository } from './supabaseRepository';
import { supabase } from './supabase';

// Factory to get available repository
export const getRepository = (): Repository => {
    if (supabase) {
        console.log('Using SupabaseRepository');
        return new SupabaseRepository();
    }
    console.log('Using MemoryRepository (No Supabase creds)');
    return new MemoryRepository();
};

export const repository = getRepository();
