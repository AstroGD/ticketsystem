# Version 2.0.5
#### Released on 10.04.2021

## Bugfixes
:bug: Fixed a bug where the bot would crash if an invalid guild id was provided in the config

## Dependency Updates
:arrow_up: Update discord.js to 12.5.3
:arrow_up: Update follow-redirects to 1.13.3

# Version 2.0.4
#### Released on 03.02.2021

## Dependency updates
:arrow_up: Update discord.js to 12.5.1
:arrow_up: Update follow-redirects to 1.13.2
:arrow_up: Update fs-extra to 9.1.0

# Version 2.0.3
#### Released 01.10.2020 (DMY)

## Bugfixes
- :bug: Fixed a bug where no Notification is being sent after a user answers a ticket
- :bug: Fixed a bug where /ticketteam would not send an error if a user has insufficient permissions
- :bug: Fixed a bug where sending /ticketteam without an action would throw no error for authorized users
- :bug: Fixed embed colour for error message if an user with insufficient permissions tries to use /ticketteam

## Dependency updates
- :arrow_up: Upgraded dependencies to newest version

## Removed Features
- :fire: Removed legacy check for me to be able to use /ticketteam without having the team-role

## Language
- :globe_with_meridians: Fixed a typo for English language pack

## UI and Style
- :lipstick: Log output regarding version checks are now colourized. If no update is available the output will be coloured green. If there is an update available or an error occurred while checking for a new version the output will be red.

## Documentation
- :memo: Added Changelog