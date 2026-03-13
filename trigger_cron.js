async function trigger() {
    console.log("Triggering Vercel Cron Endpoint...");
    const url = "https://dart-dashboard.vercel.app/api/cron?bust=" + Date.now();
    try {
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
trigger();
