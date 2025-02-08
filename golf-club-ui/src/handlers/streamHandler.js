async function handleStream(stream) {
    let fullResponse = '';
    
    for await (const chunk of stream) {
      if (chunk.content) {
        process.stdout.write(chunk.content); // Stream to console
        fullResponse += chunk.content;
        
        // Early exit if reaching token limit
        if (fullResponse.split(/\s+/).length > 450) {
          stream.controller.abort();
          return fullResponse.slice(0, 2000); // Hard truncate
        }
      }
    }
    
    return fullResponse;
  }
  