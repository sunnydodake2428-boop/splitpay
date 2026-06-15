export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { base64, mediaType } = body

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'No API key', text: null }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64}`,
                },
              },
              {
                type: 'text',
                text: `Look at this restaurant bill image carefully.
Find the FINAL amount the customer must pay.
Rules:
- It is usually at the BOTTOM of the bill
- It is labeled "Total", "Grand Total", "Net Payable", "Amount Due" or just "Total"
- Do NOT return subtotal, food total, or any tax amount separately
- The final Total includes all taxes and is the largest bottom-most amount
- Return ONLY the number like 357 or 357.00, nothing else`,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: JSON.stringify(data), text: null }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const text = data?.choices?.[0]?.message?.content?.trim()
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), text: null }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
