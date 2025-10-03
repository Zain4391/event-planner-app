import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private _supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this._supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_KEY'),
    );
  }

  get client() {
    return this._supabase;
  }

  get storage() {
    return this._supabase.storage;
  }
}
