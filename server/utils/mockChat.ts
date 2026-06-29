const MOCK_RESPONSE = JSON.stringify({
  type: 'response',
  sections: {
    tempo: {
      title: 'The Pace of Confidence',
      feel: "Slow enough to feel intentional, fast enough to keep your head moving. This is the tempo where the groove arrives before the melody does — like someone who enters a room and doesn't need to announce themselves.",
      daw_tip:
        "Set your BPM to 88. Use Live's tap tempo (T key) to feel it in your body before you commit. If it feels slightly uncomfortable, it's probably right.",
      reference: "Kaytranada — 'Weight Off'",
    },
    drums: {
      title: 'Body Language, Not Energy',
      feel: 'The kick lands with certainty. The snare is a suggestion, not a statement. Hi-hats are the thing that makes you tilt your head — slightly off, slightly swung, never mechanical.',
      daw_tip:
        'In Drum Rack, nudge your snare 20–40ms late using clip envelope automation or manual note offset. Keep the kick dead on the grid. Use a touch of Groove Pool swing at 54% on the hi-hat pattern only.',
      reference: "Sango — 'Norte'",
    },
    bass: {
      title: 'The Emotional Translator',
      feel: "Bass here is not about movement — it's about presence. It sits under everything like a held breath. When it does move, it moves with purpose: one note that slides into the next, no hurry.",
      daw_tip:
        'Use Operator with a simple sine wave on OSC A. Set attack to around 10ms, decay to taste. Add a Saturator post-chain at low drive (15–20%) to give it weight without distortion.',
      reference: null,
    },
    chords: {
      title: 'Color, Not Complexity',
      feel: "Two chords are enough. Three is a conversation. Four is a novel nobody asked for. Pick a center and let the harmony drift slightly — like a boat that stays close to the dock but keeps moving.",
      daw_tip:
        'Use Electric or Wavetable with a slow attack and a pad-like release. Stack two MIDI clips: one with the root movement, one a slightly delayed copy with a velocity drop of 30–40%. Let them breathe past each other.',
      reference: "Esta — 'When the Sun Goes Down'",
    },
    keys_scales: {
      title: 'Mood Presets',
      feel: "Stay in a minor-adjacent space that doesn't commit to sadness. There's a sweet spot between longing and ease — that's where this sound lives. Avoid anything that feels resolved or bright.",
      daw_tip:
        'In Scale MIDI effect, use Minor Pentatonic or Dorian. Lock your keyboard to it. This removes wrong notes from the equation entirely — just play by feel.',
      reference: null,
    },
    instrument: {
      title: 'Human Air in the Machine',
      feel: "One riff, played once, recorded twice. The second take should feel slightly more tired than the first — that's the one you use. Don't fix the timing. The humanness is the point.",
      daw_tip:
        'Record direct into Live. Use a Cabinet device and a light Reverb (Room size: small, Dry/Wet: 25%). Duplicate the clip, pitch shift one up 12 cents, one down 12 cents, pan them slightly left and right. Keep the original centered.',
      reference: "Kaytranada — 'Bus Ride'",
    },
    avoid: {
      title: 'What to Avoid',
      feel: "Busy transitions. More than one lead element at a time. Fills that announce themselves. Any synth that wants to be the main character. Reverb that makes things feel far away when they should feel present.",
      daw_tip:
        'If anything in your arrangement starts before or after a 4-bar boundary without intention, remove it. Restraint is the arrangement.',
      reference: null,
    },
  },
})

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function selectFixture(_messageCount: number): string {
  // The sections page always makes a one-shot call with the full preferences
  // and expects a sections response directly. Always return sections.
  return MOCK_RESPONSE
}

function chunkJson(json: string): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < json.length) {
    const size = 4 + Math.floor(Math.random() * 5) // 4–8 chars per chunk
    chunks.push(json.slice(i, i + size))
    i += size
  }
  return chunks
}

export function createMockStream(messageCount: number): ReadableStream {
  const fixture = selectFixture(messageCount)
  const chunks = chunkJson(fixture)
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      await sleep(600)

      for (const chunk of chunks) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`),
        )
        await sleep(18)
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}
