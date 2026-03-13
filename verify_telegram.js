require('dotenv').config({ path: '.env.local' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();

async function sendTelegramMessage(text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        const d = await res.json();
        if (!d.ok) console.error("Telegram send failed:", d);
        else console.log("Telegram send success:", d.result.text);
    } catch (error) {
        console.error("Telegram send error:", error);
    }
}

const message = `✅ <b>[시스템 정기 점검 안내]</b>\n\n현재 DART 모니터링 및 알림 푸시 서버가 <b>정상적으로 가동 중</b>입니다.\n\n▪️ <b>점검일시:</b> 2026년 3월 5일 오전\n▪️ <b>금일 신규 공시:</b> 아직 등록된 모니터링 대상 공시 없음\n\n(본 메시지는 푸시 기능 정상 작동 테스트를 위해 발송되었습니다.)`;

sendTelegramMessage(message);
