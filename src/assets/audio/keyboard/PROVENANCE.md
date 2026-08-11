# Keyboard audio provenance

The six production samples are compact adaptations of **“keyboard sound satisfying”**
by **Yzaak**, supplied locally by the site owner and used under the
[Pixabay Content License](https://pixabay.com/service/license-summary/).

- Source page: https://pixabay.com/sound-effects/film-special-effects-keyboard-sound-satisfying-304411/
- Contributor: Yzaak
- Published: February 24, 2025
- Local source filename: `yzaak-keyboard-sound-satisfying-304411.mp3`
- Source SHA-256: `bdfa594696dea0570ad6771fd5b7c4a9fd81e173ec38690ff56fb9c5e1f00707`
- Retrieved by the site owner: August 11, 2026

The full recording is local-only, ignored by Git, and never included in the generated
site. `npm run generate:keyboard-audio` requires that verified recording at the path
above, or at an absolute path supplied through `KEYBOARD_AUDIO_SOURCE`.

## Deterministic cut map

| Output | Start | Source duration | Treatment |
| --- | ---: | ---: | --- |
| `key-01.webm` | 0.825 s | 0.160 s | mono, 55 Hz high-pass, 11 kHz low-pass, +3.5 dB |
| `key-02.webm` | 2.315 s | 0.160 s | mono, 55 Hz high-pass, 11 kHz low-pass, +6 dB |
| `key-03.webm` | 6.180 s | 0.160 s | mono, 55 Hz high-pass, 11 kHz low-pass, +1.5 dB |
| `key-04.webm` | 8.435 s | 0.160 s | mono, 55 Hz high-pass, 11 kHz low-pass, +4 dB |
| `space.webm` | 9.590 s | 0.200 s | mono, 45 Hz high-pass, 8.5 kHz low-pass, 500 Hz body emphasis |
| `enter.webm` | 17.970 s | 0.220 s | mono, 40 Hz high-pass, 7 kHz low-pass, 360 Hz body emphasis, modest pitch reduction |

Every clip receives short edge fades and is encoded as mono 48 kHz WebM/Opus at
24 kbps. The transformations isolate individual interactions and shape Space and Enter
for their roles in the synchronized interface. Do not redistribute the source recording
or these adapted samples as a standalone audio collection.
