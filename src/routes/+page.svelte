<script>
  let messages = [];
  let userInput = '';
  let isLoading = false;

  // This is the only part that changes. We now call our own internal API route.
  const API_URL = '/api/askAnalyst'; 

  async function handleSubmit() {
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user', content: userInput };
    messages = [...messages, newUserMessage];
    isLoading = true;
    const currentInput = userInput;
    userInput = '';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: messages.slice(-4) })
      });

      if (!response.ok) throw new Error("The API call failed.");
      
      const result = await response.json();
      const aiReply = { role: 'assistant', content: result.reply };
      messages = [...messages, aiReply];

    } catch (error) {
      const errorReply = { role: 'assistant', content: 'Sorry, I encountered an error connecting to the API.' };
      messages = [...messages, errorReply];
    } finally {
      isLoading = false;
    }
  }
</script>

<!-- The rest of this file (HTML and CSS) is EXACTLY THE SAME as before -->
<main>
  <div class="header">
    <h1>Instant Analyst</h1>
    <p>Powered by the Official Cerebras API</p>
  </div>
  <div class="chat-window">
    {#each messages as message}
      <div class="message {message.role}">
        <p>{message.content}</p>
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
    <button type="submit" disabled={isLoading}>Send</button>
  </form>
</main>
<style>
  :root { --accent-color: #ff4500; }
  main { display: flex; flex-direction: column; height: 95vh; max-width: 700px; margin: auto; font-family: sans-serif; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; }
  .header { padding: 10px; text-align: center; border-bottom: 1px solid #ccc; background: #f7f7f7; }
  .header h1 { margin: 0; font-size: 1.5rem; }
  .header p { margin: 0; font-size: 0.8rem; color: #666; }
  .chat-window { flex-grow: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .message { max-width: 80%; padding: 10px 15px; border-radius: 18px; line-height: 1.4; }
  .message.user { background: var(--accent-color); color: white; align-self: flex-end; }
  .message.assistant { background: #e9e9eb; color: black; align-self: flex-start; }
  .message p { margin: 0; }
  .typing { font-weight: bold; animation: blink 1s infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  form { display: flex; padding: 10px; border-top: 1px solid #ccc; }
  input { flex-grow: 1; border: 1px solid #ccc; border-radius: 15px; padding: 10px; font-size: 1rem; }
  button { background: var(--accent-color); color: white; border: none; border-radius: 15px; padding: 10px 20px; margin-left: 10px; cursor: pointer; }
  button:disabled { background: #ccc; }
</style>