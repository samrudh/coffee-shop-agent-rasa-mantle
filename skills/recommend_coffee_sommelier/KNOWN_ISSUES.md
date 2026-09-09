# Known Issue: Re-triggering `recommend_coffee_sommelier` with Vertex AI / Gemini LLM Provider

### Summary
`recommend_coffee_sommelier` skill executes successfully on initial turn activation. However, attempting to re-trigger the skill or execute consecutive vector matching calls within the same multi-turn session fails when configured with Google Vertex AI (`gemini/gemini-2.5-flash`) via LiteLLM.

### Error Trace
```text
ProviderClientAPIException: litellm.BadRequestError: Vertex_ai_betaException BadRequestError - 
{
  "error": {
    "code": 400,
    "message": "Please ensure that function call turn comes immediately after a user turn or after a function response turn.",
    "status": "INVALID_ARGUMENT"
  }
}
```

### Technical Cause
Vertex AI API enforces strict turn ordering for function calling: an assistant turn containing `tool_calls` must immediately succeed a `user` turn or a `tool` response turn.

During multi-turn skill re-activations, Rasa Mantle's orchestrator history builder inserts intermediate assistant text turns (such as skill completion announcements or rephrased prompts) between tool responses and subsequent tool invocations. Vertex AI flags this message history sequence as `INVALID_ARGUMENT`.

### Workaround & Status
- **Status**: Documented & reported to platform team.
- **Workaround**: Start a fresh conversation session before re-invoking sensory vector recommendation, or ensure message turns sent to LLM provider preserve strict Gemini function call sequence guidelines.
