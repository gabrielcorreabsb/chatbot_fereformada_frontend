// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Suas chaves que já usamos no Postman
const SUPABASE_URL = 'https://viiocmaxmfmbgyszkeha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaW9jbWF4bWZtYmd5c3prZWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTk1MDAsImV4cCI6MjA3NzA3NTUwMH0.cNpqV1KLGeY8BE9R7Zz1_Gwfubo0XFDjhqtU0ILmp34';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);