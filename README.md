# Bedtime

A Nuxt 3 chat application with OpenAI GPT-3.5-turbo integration and streaming responses.

## Features

- Nuxt 3 with TypeScript
- OpenAI Chat Completions API with streaming
- Custom `useChat` composable (Vue equivalent of Vercel AI SDK's useChat)
- Tailwind CSS styling
- Production-ready for Vercel deployment

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:

```
OPENAI_API_KEY=sk-your-api-key-here
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000/chat`

## Production

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deploy to Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add the `OPENAI_API_KEY` environment variable in Vercel's project settings
4. Deploy

## Project Structure

```
├── composables/
│   └── useChat.ts       # Chat state management composable
├── pages/
│   ├── chat.vue         # Main chat interface
│   └── index.vue        # Redirects to /chat
├── server/
│   └── api/
│       └── chat.post.ts # OpenAI streaming API endpoint
├── app.vue              # Root component
├── nuxt.config.ts       # Nuxt configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vercel.json          # Vercel deployment config
```

## API Route

The `/api/chat` endpoint accepts POST requests with the following body:

```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

Responses are streamed as Server-Sent Events (SSE).

## License

MIT
