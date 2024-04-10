# Contributing guide

Thank you for considering contributing to this open source project!

This guide will ensure that you have all the necessary information needed to be an effective contributor to the
prompt-injection project.

There are many ways you can contribute.
Feel free to raise issues for bug reports or new feature requests.
We also welcome people to write documentation.

Please do read through our [code of conduct](CODE_OF_CONDUCT.md) before contributing.

## Before you create an issue

- Does the issue already exist? _Remember to check **open** and **closed** issues._
- Is this a security issue? _Do **NOT** open an issue. Email cwilton@scottlogic.com instead._

## What to include in the issue

- ### Bug

  - A short and clear title of the bug.
  - Reproduction steps or a link to a project that shows the bug.
  - Expected and actual behaviour.
  - What browser was being used.
  - Include screenshots where appropriate.
  - Label the issue appropriately.

- ### New Feature / Improvement
  - A short and clear title of the new feature / improvement.
  - A more detailed description of the new feature / improvement (adding code snippets if you desire).
  - Include screenshots where appropriate.
  - Label the issue appropriately.

## Before you start working on an issue

- Fork the repo.
- Have you contributed before? _If not, look for issues with the 'good first issue' label._
- Is it assigned to anyone else? _If so, post a message to see if the assignee is still working on it._
- Is it assigned to you? _If not, post a message stating your intent so that the maintainers and other contributors know
  what is being developed._
- Do you understand the issue fully? _If not, ask a question on the issue. We are all here to help you contribute._
- Check the issue labels. Some of them indicate that you shouldn't start developing yet:
  - `triage` means that a contributor has created the issue, and a maintainer hasn't looked at it yet. _This means that
    we might not accept work done for this issue._
  - `question` means that we need to agree on some points before implementing the issue. _Look in the comments and feel
    free to get involved in discussion!_
  - `blocked` means the issue cannot be resolved until a different piece of work is finished. _Look in the comments to
    see what is blocking it, and make sure it is resolved before starting the current issue._
  - `ui` means that we are waiting for input from the designer on the maintainer team before implementing the issue.

## When you submit a Pull Request (PR)

- [Link the issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) that the PR addresses.
- Link any related PRs.
- Have you added tests?
- Are all workflow steps passing?
- Is it ready for review? If not, mark the PR as a draft.
- Include the ticket number in the PR name.

### Adding tests

Our project has unit tests and integration tests. We expect tests to be written / altered when a PR adds a new feature
or modifes existing behaviour. It is generally up to you to judge what depth of testing to go into.

### Checking the workflow steps

When a PR is submitted or updated, GitHub automatically runs checks on affected code via
[workflow actions](https://docs.github.com/en/actions/using-workflows).
A PR cannot be merged until all workflow steps have passed.
