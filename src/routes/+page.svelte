<script>
  import { afterUpdate } from 'svelte';

  let messages = [];
  let userInput = '';
  let isLoading = false;
  let lastResponseTime = 0;
  let chatContainer; // This will be a reference to our chat div

  // This is the magic that fixes the scrolling.
  // After the UI updates, it scrolls the chat window to the bottom.
  afterUpdate(() => {
    if (chatContainer) {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }
  });

  const benchmarkPrompts = [
    { title: 'Simple Question', prompt: 'What is the theory of relativity in simple terms?' },
    { title: 'Summarization', prompt: 'Summarize the plot of the movie Inception in three sentences.' },
    { title: 'Code Generation', prompt: 'Write a Python function that returns the sum of a list of numbers.' },
  ];

  const API_URL = '/api/askAnalyst';

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
    userInput = '';

    const startTime = performance.now();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: messages.slice(-4) })
      });
      
      const endTime = performance.now();
      lastResponseTime = Math.round(endTime - startTime);

      if (!response.ok) throw new Error("API call failed");
      
      const result = await response.json();
      const aiReply = { role: 'assistant', content: result.reply, time: lastResponseTime };
      messages = [...messages, aiReply];

    } catch (error) {
      const errorReply = { role: 'assistant', content: 'Sorry, an error occurred.', time: 0 };
      messages = [...messages, errorReply];
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="app-layout">
  <!-- ====== CONTROL PANEL (TOP) ====== -->
  <div class="control-panel">
    <div class="header">
      <h1>Instant Analyst</h1>
      <p>A Live Benchmark for the Official Cerebras API</p>
    </div>
    <div class="guide-section">
      <h2>Test the Speed</h2>
      <p>Click a button to send a prompt and see the real-world response time.</p>
      <div class="prompt-buttons">
        {#each benchmarkPrompts as item}
          <button class="prompt-btn" on:click={() => runBenchmark(item.prompt)} disabled={isLoading}>
            {item.title}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- ====== CHAT TRANSCRIPT (MIDDLE, SCROLLABLE) ====== -->
  <div class="chat-window" bind:this={chatContainer}>
    {#if messages.length === 0}
      <div class="placeholder">
        <p>Your conversation will appear here.</p>
        <span>Click a button above or type your own question below to begin.</span>
      </div>
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
    {#if isLoading && messages.length > 0}
      <div class="message assistant">
        <p class="typing"><span>.</span><span>.</span><span>.</span></p>
      </div>
    {/if}
  </div>

  <!-- ====== INPUT FORM (BOTTOM) ====== -->
  <div class="form-container">
    <form on:submit|preventDefault={handleSubmit}>
      <input type="text" bind:value={userInput} placeholder="...or ask your own complex question" disabled={isLoading} />
      <button type="submit" disabled={isLoading}>Benchmark Speed</button>
    </form>
  </div>
</div>

<style>
  :root { --accent-color: #ff4500; }

  /* Main layout container */
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 800px;
    margin: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    background: #fff;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
  }

  /* Top section - not scrollable */
  .control-panel {
    border-bottom: 1px solid #eee;
  }
  .header { padding: 1rem; text-align: center; }
  .header h1 { margin: 0; }
  .header p { margin: 0.25rem 0 0 0; color: #666; }

  .guide-section { padding: 0 1.5rem 1.5rem 1.5rem; text-align: center; }
  .guide-section h2 { margin: 0 0 0.5rem 0; }
  .guide-section p { margin: 0 0 1rem 0; font-size: 0.9rem; color: #555; }
  .prompt-buttons { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  .prompt-btn { background: #f7f7f7; border: 1px solid #ddd; border-radius: 16px; padding: 8px 16px; cursor: pointer; transition: all 0.2s ease; }
  .prompt-btn:hover:not(:disabled) { background: #eee; border-color: #ccc; }
  .prompt-btn:disabled { cursor: not-allowed; opacity: 0.6; }

  /* Middle scrollable chat area */
  .chat-window {
    flex-grow: 1; /* This makes it fill the available space */
    padding: 1.5rem;
    overflow-y: auto; /* This enables scrolling */
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .placeholder { margin: auto; text-align: center; color: #aaa; }
  .placeholder span { font-size: 0.9rem; }

  .message { max-width: 80%; padding: 0.75rem 1.25rem; border-radius: 1.25rem; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .message.user { background: var(--accent-color); color: white; align-self: flex-end; border-bottom-right-radius: 0.5rem; }
  .message.assistant { background: #f0f0f0; color: #333; align-self: flex-start; border-bottom-left-radius: 0.5rem; }
  .message p { margin: 0; white-space: pre-wrap; }
  .speed-badge { font-size: 0.75rem; color: #555; background-color: #0000000d; padding: 3px 8px; border-radius: 10px; margin-top: 0.75rem; display: inline-block; }

  /* Typing indicator animation */
  .typing span { animation: blink 1.4s infinite both; font-size: 1.5rem; font-weight: bold; }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }

  /* Bottom input form area */
  .form-container { padding: 1rem; border-top: 1px solid #eee; }
  form { display: flex; gap: 0.75rem; }
  input { flex-grow: 1; border: 1px solid #ccc; border-radius: 1.5rem; padding: 0.75rem 1.25rem; font-size: 1rem; }
  button { background: var(--accent-color); color: white; border: none; border-radius: 1.5rem; padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; font-weight: 500; }
  button:disabled { background: #ccc; }
</style>