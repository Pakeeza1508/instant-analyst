<script>
  let messages = [];
  let userInput = '';
  let isLoading = false;
  // This will store our speed measurement
  let lastResponseTime = 0;

  const API_URL = '/api/askAnalyst';

  async function handleSubmit() {
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user', content: userInput };
    messages = [...messages, newUserMessage];
    isLoading = true;
    const currentInput = userInput;
    userInput = '';

    // --- SPEEDOMETER START ---
    const startTime = performance.now();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: messages.slice(-4) })
      });
      
      // --- SPEEDOMETER STOP ---
      const endTime = performance.now();
      lastResponseTime = Math.round(endTime - startTime); // Calculate the duration in ms

      if (!response.ok) throw new Error("The API call failed.");
      
      const result = await response.json();
      // Add the response time to the message object itself!
      const aiReply = { role: 'assistant', content: result.reply, time: lastResponseTime };
      messages = [...messages, aiReply];

    } catch (error) {
      const errorReply = { role: 'assistant', content: 'Sorry, I encountered an error connecting to the API.', time: 0 };
      messages = [...messages, errorReply];
    } finally {
      isLoading = false;
    }
  }
</script>

<main>
  <div class="header">
    <h1>Instant Analyst</h1>
    <p>A Live Benchmark for the Official Cerebras API</p>
  </div>

  <div class="chat-window">
    {#each messages as message}
      <div class="message {message.role}">
        <p>{message.content}</p>
        <!-- If this is an assistant message and it has a time, show it -->
        {#if message.role === 'assistant' && message.time}
          <div class="speed-badge">
            Response in: {message.time}ms
          </div>
        {/if}
      </div>
    {/each}
    {#if isLoading}
      <div class="message assistant">
        <p class="typing">...</p>
      </div>
    {/if}
  </div>

  <form on:submit|preventDefault={handleSubmit}>
    <input type="text" bind:value={userInput} placeholder="Ask a complex question..." disabled={isLoading} />
    <button type="submit" disabled={isLoading}>Benchmark Speed</button>
  </form>
</main>

<style>
  :root { --accent-color: #ff4500; }
  main { display: flex; flex-direction: column; height: 95vh; max-width: 700px; margin: auto; font-family: sans-serif; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; }
  .header { padding: 10px; text-align: center; border-bottom: 1px solid #ccc; background: #f7f7f7; }
  .header h1 { margin: 0; font-size: 1.5rem; }
  .header p { margin: 0; font-size: 0.8rem; color: #666; }
  .chat-window { flex-grow: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .message { max-width: 80%; padding: 10px 15px; border-radius: 18px; line-height: 1.4; position: relative; } /* Added relative position */
  .message.user { background: var(--accent-color); color: white; align-self: flex-end; }
  .message.assistant { background: #e9e9eb; color: black; align-self: flex-start; }
  .message p { margin: 0; }
  .typing { font-weight: bold; animation: blink 1s infinite; }
  @keyframes blink { 50% { opacity: 0; } }

  /* --- NEW STYLE FOR THE SPEEDOMETER BADGE --- */
  .speed-badge {
    font-size: 0.7rem;
    color: #555;
    background-color: #00000010;
    padding: 2px 6px;
    border-radius: 8px;
    margin-top: 8px;
    display: inline-block;
  }
  
  form { display: flex; padding: 10px; border-top: 1px solid #ccc; }
  input { flex-grow: 1; border: 1px solid #ccc; border-radius: 15px; padding: 10px; font-size: 1rem; }
  button { background: var(--accent-color); color: white; border: none; border-radius: 15px; padding: 10px 20px; margin-left: 10px; cursor: pointer; }
  button:disabled { background: #ccc; }
</style>