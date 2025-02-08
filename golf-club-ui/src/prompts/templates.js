// Replace verbose prompts with this template
export const concisePrompt = ({ task, inputs, requirements }) => `
[Task] ${task}
[Inputs] ${inputs.join(', ')}
[Requirements] ${requirements.join(', ')}
[Output Format] Markdown tables with brief explanations
`;

// Usage example
const prompt = concisePrompt({
  task: "Generate API documentation",
  inputs: ["userController.js", "authService.py"],
  requirements: ["Include error codes", "List rate limits"]
});
