// Token counting library (install first: npm install tiktoken)
const { encoding_for_model } = require('tiktoken');

function pruneContext(messages, maxTokens = 15000) {
  const encoder = encoding_for_model('claude-3-5-sonnet');
  let tokenCount = messages.reduce((acc, msg) => 
    acc + encoder.encode(msg.content).length, 0);

  while (tokenCount > maxTokens && messages.length > 1) {
    // Remove oldest non-system message
    const removed = messages.splice(1, 1)[0];
    tokenCount -= encoder.encode(removed.content).length;
  }
  
  return messages;
}

// Add to your existing API call flow
async function getClaudeResponse(messages) {
  const prunedMessages = pruneContext([...messages]);
  
  return await anthropic.messages.create({
    model: 'claude-3-5-sonnet',
    messages: prunedMessages,
    max_tokens: 500, // Enforce output limit
    stream: true // Enable streaming
  });
}
