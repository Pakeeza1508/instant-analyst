<script>
  let messages = [];
  let userInput = '';
  let isLoading = false;
  let lastResponseTime = 0;

  // --- NEW: Pre-defined benchmark prompts ---
  const benchmarkPrompts = [
    { title: 'Simple Question', prompt: 'What is the theory of relativity in simple terms?' },
    { title: 'Summarization', prompt: 'Summarize the plot of the movie Inception in three sentences.' },
    { title: 'Code Generation', prompt: 'Write a Python function that takes a list of numbers and returns the sum.' },
  ];

  const API_URL = '/api/askAnalyst';

  // --- NEW: A function to run a pre-defined benchmark ---
  function runBenchmark(prompt) {
    userInput = prompt;
    handleSubmit();
  }

  async function handleSubmit() {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage = { role: 'user', content: userInput };
    messages = [...messages, newUserMessage];
    isLoading = true;
    const currentInput = userInput;
    userInput = ''; // Clear input after sending

    const startTime = performance.now();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: messages.slice(-4) })
      });
      
      const endTime = performance.now();
      lastResponseTime = Math.round(endTime - startTime);

      if (!response.ok) throw new Error("The API call failed.");
      
      const result = await response.json();
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

  <!-- --- NEW: The Guided Experience Section --- -->
  <div class="guide-section">
    <h2>Test the Speed</h2>
    <p>Click a button to send a pre-defined prompt and see the real-world response time in milliseconds. The timer measures the full round-trip from your browser to the AI and back.</p>
    <div class="prompt-buttons">
      {#each benchmarkPrompts as item}
        <button class="prompt-btn" on:click={() => runBenchmark(item.prompt)} disabled={isLoading}>
          {item.title}
        </button>
      {/each}
    </div>
  </div>

  <div class="chat-window">
    {#if messages.length === 0}
      <div class="placeholder">Your conversation will appear here...</div>
    {/if}
    {#each messages as message}
      <div class="message {message.role}">
        <p>{message.content}</p>
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
    <input type="text" bind:value={userInput} placeholder="...or ask your own complex question" disabled={isLoading} />
    <button type="submit" disabled={isLoading}>Benchmark Speed</button>
  </form>
</main>

<style>
  :root { --accent-color: #ff4500; }
  main { display: flex; flex-direction: column; height: 95vh; max-width: 700px; margin: auto; font-family: sans-serif; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; background: #fdfdfd; }
  .header { padding: 10px; text-align: center; border-bottom: 1px solid #eee; background: #fff; }
  
  /* --- NEW STYLES --- */
  .guide-section {
    padding: 1rem 1.5rem;
    text-align: center;
    background: #fff;
    border-bottom: 1px solid #eee;
  }
  .guide-section h2 { margin: 0 0 0.5rem 0; }
  .guide-section p { margin: 0 0 1rem 0; font-size: 0.9rem; color: #555; }
  .prompt-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .prompt-btn {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .prompt-btn:hover:not(:disabled) {
    background: #f7f7f7;
    border-color: #aaa;
  }
  .prompt-btn:disabled { cursor: not-allowed; opacity: 0.6; }
  .placeholder {
    margin: auto;
    color: #aaa;
  }
  /* --- END NEW STYLES --- */

  .chat-window { flex-grow: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .message { max-width: 80%; padding: 10px 15px; border-radius: 18px; line-height: 1.4; position: relative; }
  .message.user { background: var(--accent-color); color: white; align-self: flex-end; }
  .message.assistant { background: #e9e9eb; color: black; align-self: flex-start; }
  .message p { margin: 0; white-space: pre-wrap; } /* Allows code formatting */
  .typing { font-weight: bold; animation: blink 1s infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  .speed-badge { font-size: 0.7rem; color: #555; background-color: #00000010; padding: 2px 6px; border-radius: 8px; margin-top: 8px; display: inline-block; }
  form { display: flex; padding: 10px; border-top: 1px solid #eee; background: #fff; }
  input { flex-grow: 1; border: 1px solid #ccc; border-radius: 15px; padding: 10px; font-size: 1rem; }
  button { background: var(--accent-color); color: white; border: none; border-radius: 15px; padding: 10px 20px; margin-left: 10px; cursor: pointer; }
  button:disabled { background: #ccc; }
</style>