# Snow Trip Packing Board

A lightweight, mobile-first item-by-person packing tracker for moving belongings from a hotel to the snow mountain.

## Features

- Editable people and item lists
- Large status controls that cycle through Unknown, Packed, and Unpacked
- Automatic local saving in the browser
- JSON backup import and export
- Offline support after the first hosted visit
- No accounts, backend, build step, or third-party dependencies

## Run locally

Open `index.html` directly for the core app. For full offline service-worker support, serve this folder over `localhost` or HTTPS.

Run the state tests with Node.js:

```text
npm test
```

## Hosting

The project can be hosted directly with GitHub Pages from the repository root.

## Open-source foundation

This project was adapted from the architecture of [Pantry Trip Checklist](https://github.com/yanqr213/pantry-trip-checklist), an MIT-licensed, zero-build offline PWA. Its quantity-based pantry interface and data model were replaced with this project's item-by-person, three-state packing board. The original MIT license notice is retained in `LICENSE`.
