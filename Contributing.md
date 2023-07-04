## How to Contribute

👍🎉 First of all, thank you for your interest in next-axiom! We'd love to accept your patches and contributions! 🎉👍

This project accepts contributions. In order to contribute, you should pay attention to a few guidelines:

## Reporting Issues

Bugs, feature requests, and development-related questions should be directed to our GitHub [issue tracker.](https://github.com/axiomhq/next-axiom/issues)

When reporting a bug, please try and provide as much context as possible such as your operating system, NodeJS version and anything else that might be relevant to the bug. For feature requests, please explain what you're trying to do and how the requested feature would help you do that.

## Setup

[Fork](https://github.com/axiomhq/next-axiom), then clone this repository:

```
git clone https://github.com/axiomhq/next-axiom
cd next-axiom
```

### Install development dependencies

```
pnpm install
```

## Submitting Modifications

1. It's generally best to start by opening a new issue describing the bug or feature you're intending to fix. Even if you think it's relatively minor, it's helpful to know what people are working on. Mention in the initial issue that you are planning to work on that bug or feature so that it can be assigned to you.

2. Follow the normal process of forking the project, and setup a new branch to work in. It's important that each group of changes be done in separate branches in order to ensure that a pull request only includes the commits related to that bug or feature.

3. Make sure that the tests and the linters pass by running:

```
pnpm run test
pnpm run lint
```

4. Do your best to have [well-formatted](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) commit messages for each change. This provides consistency throughout the project and ensures that commit messages are able to be formatted properly by various git tools.

5. Finally, push the commits to your fork and submit a [pull request](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

## Once you've filed the PR:

- One or more maintainers will use GitHub's review feature to review your PR.
- If the maintainer asks for any changes, edit your changes, push, and ask for another review.
- If the maintainer decides to suggest some improvements or alternatives, modify and make improvements. Once your changes are approved, one of the project maintainers will merge them.
