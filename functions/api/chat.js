export async function onRequestPost(context) {
  // context contains the incoming request and your Cloudflare Environment Variables
  const { request, env } = context;

  try {
    // 1. Safety check: Did we remember to add the key in Cloudflare?
    if (!env.GROQ_SECRET_KEY) {
      return new Response(JSON.stringify({ 
        error: { message: "Server configuration error: Missing API Key." } 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Grab the chat messages sent from your frontend index.html
    const requestBody = await request.json();

    // 3. Make the secure request to Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_SECRET_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-specdec',
        messages: requestBody.messages
      })
    });

    // 4. Get the response back from Groq
    const data = await groqResponse.json();

    // 5. If Groq threw an error (like rate limiting), pass it to the frontend
    if (!groqResponse.ok) {
      return new Response(JSON.stringify(data), { 
        status: groqResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 6. Send the successful AI response back to your frontend!
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Catch any wild server errors
    return new Response(JSON.stringify({ 
      error: { message: `Internal Server Error: ${error.message}` } 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
