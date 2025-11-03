import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkkikobakypwldmnjxir.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRra2lrb2Jha3lwd2xkbW5qeGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjkzNDksImV4cCI6MjA3NzcwNTM0OX0.NvPgQifIpZ_dVzMoSznmkivj4GQ2O5UPDFpyt2xA_Wg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
