# Security and privacy

This document describes the current security and privacy behavior of Mikveh and explains how to report a concern. It reflects the checked-in source for the current `1.0.0` project version; future releases may change the permission or data-flow profile.

## Current permission model

The Manifest V3 configuration declares:

- `storage` — allows Mikveh to save the selected theme preference in Chrome extension storage.
- `https://bible-api.com/*` host access — allows the popup to request random Bible verses and specific verse references over HTTPS.

The current manifest does not request permissions to read active tabs, page contents, browsing history, bookmarks, downloads, cookies, or the clipboard as a broad site permission. The clipboard is accessed only when the user activates the Copy control.

## Data handled by the extension

### Theme preference

The selected System, Light, or Dark setting is stored locally through `chrome.storage.local`. It is used to restore the appearance when the popup is opened again. The current implementation does not send the theme preference to a Mikveh server.

### Bible API requests

When the popup opens, Mikveh makes an HTTPS request to the random WEB verse endpoint on `bible-api.com`. When a user searches for a passage, the book, chapter, and verse are encoded into the request URL and sent to the same service.

As with other internet requests, the API provider receives the requested reference for a lookup and normal request metadata, which can include the connecting IP address, user-agent details, and request timing. Mikveh does not operate the API service and cannot guarantee how the provider logs, stores, or processes its request data. Review the provider's current policies independently.

### Clipboard

The Copy action writes the currently displayed Bible reference and verse text to the clipboard after the user clicks the button. It does not run automatically when the popup opens or when a verse is searched.

### No account or Mikveh backend

The current extension does not require an account and does not include a Mikveh-operated server, analytics SDK, advertising component, or remote script loader. Verse text is provided by the external Bible API.

## Safe installation

- Obtain the project from the official repository once its URL is published.
- Before loading an unpacked build, inspect `manifest.json` and confirm that the requested permissions match the documented behavior.
- Avoid unofficial repackaged or modified copies.
- Keep Chrome and your operating system updated.
- Do not install a modified build from an untrusted person or source.
- Treat clipboard contents and any information visible in your browser profile as accessible to other software or people who can access that profile.

## Reporting a vulnerability

Please do not publish exploitable vulnerability details in a public issue before the maintainer has had a reasonable opportunity to investigate.

Until a dedicated private reporting workflow is published, contact the copyright holder at **Darsh.seraphic@gmail.com**. Include only the information needed to understand and reproduce the issue. Do not send passwords, personal data, private messages, or unrelated sensitive information.

A useful report includes:

- A concise description of the issue and its potential impact.
- The affected Mikveh version, Chrome version, and operating system.
- Reproduction steps or a minimal proof of concept.
- Any suggested mitigation, if known.

No response-time guarantee is made. The maintainer may coordinate a fix and publish an advisory when appropriate.

## Scope

This policy covers the Mikveh extension, website files, and official project distribution. It does not cover vulnerabilities in Chrome, the operating system, or bible-api.com except where Mikveh's integration contributes to the issue.
