const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabase = createClient(supabaseUrl, supabaseKey);

const DART_API_KEY = process.env.DART_API_KEY?.trim();

async function testDart() {
    const { data: companies } = await supabase.from('companies').select('*');
    const corpCodes = new Set(companies.map(c => c.corp_code));
    console.log(`Loaded ${corpCodes.size} companies from DB.`);

    const today = new Date();
    today.setHours(today.getHours() + 9);
    const bgnde = today.toISOString().split('T')[0].replace(/-/g, '');

    console.log("Checking DART for date:", bgnde);

    try {
        let pageNo = 1;
        let totalPage = 1;
        let found = [];
        do {
            const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${DART_API_KEY}&bgn_de=${bgnde}&end_de=${bgnde}&page_no=${pageNo}&page_count=100`;
            const res = await fetch(dartUrl);
            const dartData = await res.json();
            totalPage = dartData.total_page || 1;

            if (dartData.list) {
                const matches = dartData.list.filter(i => corpCodes.has(i.corp_code));
                if (matches.length > 0) found.push(...matches.map(m => `${m.corp_name} - ${m.report_nm} (Page ${pageNo})`));
            }
            pageNo++;
        } while (pageNo <= totalPage);

        console.log("Found ALL monitored filings for today:");
        console.log(found.length > 0 ? found : "None");
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testDart();
