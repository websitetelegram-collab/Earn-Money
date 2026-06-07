export async function onRequestPost(context) {
    const cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    try {
        const { token, chatIds, message, photoUrl, replyMarkup } = await context.request.json();
        if (!token || !chatIds || !message) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), {
                headers: { ...cors, 'Content-Type': 'application/json' }
            });
        }
        const results = { sent: 0, failed: 0 };
        for (const chatId of chatIds) {
            try {
                const apiUrl = photoUrl
                    ? `https://api.telegram.org/bot${token}/sendPhoto`
                    : `https://api.telegram.org/bot${token}/sendMessage`;
                const payload = photoUrl
                    ? { chat_id: chatId, photo: photoUrl, caption: message, parse_mode: 'HTML', ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }
                    : { chat_id: chatId, text: message, parse_mode: 'HTML', ...(replyMarkup ? { reply_markup: replyMarkup } : {}) };
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.ok) results.sent++; else results.failed++;
                await new Promise(r => setTimeout(r, 30));
            } catch(e) { results.failed++; }
        }
        return new Response(JSON.stringify(results), {
            headers: { ...cors, 'Content-Type': 'application/json' }
        });
    } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...cors, 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
