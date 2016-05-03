# Project Bootstrapper

Generates a new repo and pre-populated waffle board for Code for Denver projects and events.

Site: https://cfd-new.herokuapp.com/


## Contributing

Claim or submit issues on our [Waffle Board](https://waffle.io/codefordenver/project-bootstrapper)

### Pre-populated waffle card content
If you'd like to suggest a change to one of the cards in the pre-populated waffle board, you can edit the file directly in either the [content/cards/event](content/cards/event) directory or the [content/cards/project](content/cards/project) directory (depending on whether it is a new project or new event you want to update).

If you'd like to add a new card, or update the cards' order, title, or labels, you'll need to update the json files that configure the cards ([content/cards-event.json](content/cards-event.json) or [content/cards-project.json](content/cards-project.json)).

### Initial default repo files
If you'd like to update or add default files for new projects, those files can be found in the [content/default-files](content/default-files) directory.

### Process
For the contributing process for this repo please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Running locally

You will need to export 3 environment variables:
- `HACKSHOP_SESSION_SECRET`
- `HACKSHOP_WAFFLE_CLIENT_ID`
- `HACKSHOP_WAFFLE_CLIENT_SECRET`

You will probably need to get these variables from [Willy](https://github.com/wdoug) or another contributor.

Then you can clone the repo, install dependencies with `npm install`, and run it with `npm start`
