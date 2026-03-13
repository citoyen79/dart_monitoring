import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const logs: string[] = [];
    logs.push("Debug start");

    const DART_API_KEY = process.env.DART_API_KEY?.trim();
    if (!DART_API_KEY) return NextResponse.json({ logs, error: 'NO DART API KEY' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ logs, error: 'NO SUPABASE KEYS' });

    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    });

    const { data: companies, error: cmpError } = await supabase.from('companies').select('corp_code, corp_name');
    logs.push(`Companies count: ${companies?.length}, error: ${cmpError}`);

    const today = new Date();
    today.setHours(today.getHours() + 9);
    const bgnde = today.toISOString().split('T')[0].replace(/-/g, '');
    logs.push(`bgnde: ${bgnde}`);

    const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${DART_API_KEY}&bgn_de=${bgnde}&end_de=${bgnde}&page_no=1&page_count=100`;
    logs.push(`Dart URL: ${dartUrl}`);

    try {
        const res = await fetch(dartUrl, { cache: 'no-store' });
        const data = await res.json();
        logs.push(`Dart API status: ${data.status} ${data.message}`);
        logs.push(`Dart API list length: ${data.list?.length}`);

        let foundCorpCodes = [];
        if (data.list) {
            for (const item of data.list) {
                if (companies?.some(c => c.corp_code === item.corp_code)) {
                    foundCorpCodes.push(item.corp_name);
                }
            }
        }
        logs.push(`Matches found on page 1: ${foundCorpCodes.join(',')}`);

        const { data: announcements } = await supabase.from('announcements').select('id, rcept_no');
        logs.push(`Announcements in DB: ${announcements?.length}`);

    } catch (e: any) {
        logs.push(`Exception: ${e.message}`);
    }

    return NextResponse.json({ logs });
}
