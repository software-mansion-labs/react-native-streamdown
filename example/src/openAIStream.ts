import EventSource from 'react-native-sse';

const OPENAI_API_KEY = 'API_KEY';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function streamOpenAIResponse(
  prompt: string,
  onChunk: (token: string) => void,
  onComplete: () => void,
  onError: (message: string) => void,
  systemPrompt?: string
): void {
  const messages: ChatMessage[] = [
    ...(systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }]
      : []),
    { role: 'user', content: prompt },
  ];

  const eventSource = new EventSource(OPENAI_API_URL, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
    }),
  });

  eventSource.addEventListener('message', (event) => {
    if (event.data === '[DONE]') {
      eventSource.close();
      onComplete();
      return;
    }
    try {
      const chunk = JSON.parse(event.data ?? '');
      const content = chunk.choices?.[0]?.delta?.content;
      if (typeof content === 'string' && content.length > 0) {
        onChunk(content);
      }
    } catch (error) {
      console.warn('[openAIStream] Failed to parse SSE chunk:', error);
    }
  });

  eventSource.addEventListener('error', (event) => {
    eventSource.close();
    onError(event.type !== 'timeout' ? event.message : 'Stream error');
  });
}
