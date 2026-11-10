# Changelog

Notable changes to Mikveh are documented here. The format follows a simple version-and-date history.

## [Unreleased]

### Changed

- Moved the static project website files into `docs/` and updated icon/document links for the new location.
- Updated the README and website publishing instructions to use `docs/` as the GitHub Pages source directory.

## [1.0.0] - 2026-11-08

### Added

- Initial Mikveh Chrome extension using Manifest V3.
- Random World English Bible verse request when the popup opens.
- Bible reference search using the `Book Chapter:Verse` format, including examples such as `Luke 1:37`.
- Backward-compatible slash reference format, such as `luke/1:37`.
- New random verse action.
- Copy action for the reference and verse text.
- System, Light, and Dark theme modes with a cycling theme button.
- Local persistence of the theme preference using Chrome extension storage.
- Loading, invalid-reference, network-error, and malformed-response handling.
- Cross-based Mikveh icon family in PNG and SVG formats.
- Responsive project website with product overview, feature descriptions, reference examples, privacy details, installation instructions, and FAQ.
- Project README, contribution guidance, security notes, design credits, website setup notes, and proprietary source-available license.

### Notes

- Mikveh is not listed in the Chrome Web Store; installation instructions use Git clone and Chrome's **Load unpacked** workflow.
- Verse requests use `bible-api.com` and require an internet connection.
- The current version uses the WEB translation and does not include a translation selector, verse history, bookmarks, or favourites.
