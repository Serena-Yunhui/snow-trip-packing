# Snow Trip Packing Board

## Project Purpose

Build a lightweight, mobile-friendly packing tracker for moving belongings from a hotel stay to the snow mountain. The recommended GitHub repository name is `snow-trip-packing-board`.

## Core Experience

- Display item names as rows.
- Let users create and edit a list of people.
- Provide a large tap target for each relevant item/person entry.
- Cycle each entry through three states with successive taps: Unknown, Packed, and Unpacked.
- Give every state distinct, accessible colour coding plus a text label or icon; colour must not be the only signal.
- Make the interface comfortable on narrow phone screens without tiny controls or accidental horizontal overflow.
- Provide a prominent Clear All action with confirmation before resetting every status.

## Product Decisions

Prefer a lightweight browser app that opens quickly on a phone. Store the list and statuses locally on the device for the first version. Do not add accounts, cloud syncing, or multi-user collaboration unless explicitly requested.

Use predictable status colours: neutral grey for Unknown, green for Packed, and amber or red for Unpacked. Keep the tap order consistent everywhere and show the current state clearly.

## Repository Structure and Validation

This project has no implementation or established build commands yet. Inspect the repository before selecting a framework or adding scripts. Keep application code, tests, and documentation clearly separated once the structure is established.

Verify the finished experience on both desktop and a phone-sized viewport. Test adding people and items, completing multiple status cycles, refreshing to confirm persistence, and clearing all data. Check keyboard access, readable contrast, tap-target size, and mobile overflow.

## Agent-Specific Instructions

Proceed with reasonable assumptions and keep explanations concise. Ask questions only when a choice would materially change the product. Preserve existing user work, avoid unrelated changes, and verify behaviour after implementation.
