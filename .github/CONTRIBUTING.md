# How to Contribute

#### Code of Conduct
This project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

#### Questions
Have questions? Ask them in our [forum]!

## Reporting Bugs
Before reporting a bug, please perform the following basic troubleshooting steps:

1. Check to see if the problem has already been reported
	- Take a look through the list of [known bugs][search-label-bug] to see if someone has already created an issue that describes the problem you’re experiencing. If an issue already exists, consider adding any additional context you have about the problem in a comment.
2. Try the latest stable version of Excalibur
	- If you’re not using the latest [release][releases], your problem may already be fixed. Please upgrade to the latest stable version and see if you still experience the problem.
	- Alternatively, if you’re using a new unstable release, try rolling back to the latest stable release.
3. Try using older versions of Excalibur
	- If you’re already using the latest release, try out the previous few versions. This will help us determine where the problem first appeared.
4. Try different browsers
	- The problem you’re seeing may only appear in certain browsers or mobile devices. If you can, please try several different browsers/platforms to see if the issue persists.

When you submit an issue, a markdown template will automatically populate the editor window. Remove the “Other Issues Template” and fill out the “Bug Template”. We’ve included helpful hints for filling out the bug report in the template.


## Suggesting Improvements
If you have an idea for a new feature, or an improvement to existing functionality, use the “Other Issues” Template. We’ve included helpful hints for filling out the issue in the template. 

Please look through our [backlog][issues] to see if your improvement has already been suggested. If so, feel free to provide additional comments or thoughts on the existing issue.

## Submitting Changes

#### Getting Started
Below is the general workflow for submitting changes:

1. Create or discuss an issue you wish to contribute to
2. Create a fork
3. Commit to your fork with your changes
4. Submit a pull request, making sure to reference the issue you're addressing
5. Make sure it passes the CI build
6. Wait for a project contributor to give you feedback, and make changes if necessary
7. Once your changes are merged, celebrate!

If you’re not sure where to start, take a look at the jump-in or help wanted issue labels.

#### Creating a Pull Request
- Please do all of your work in a new git branch. Only include code in the branch for the single issue you are working on.
- Include Jasmine tests for your changes, following our [styleguide](#tests). Put them in the src/spec folder.
- Document new public methods and properties based on the [styleguide](#documentation).
- Update CHANGELOG.md with your changes. The categories we use are adapted from [Keep a Changelog][keep-a-changelog]:
  - `Breaking Changes` for changes to the existing API that are not backwards compatible
  - `Added` for new features
  - `Changed` for changes in existing functionality
  - `Deprecated` for features that will be removed in an upcoming release
  - `Removed` for deprecated features removed in this release
  - `Fixed` for bug fixes
- Squash your local commits into logical atomic changes. Please follow our [styleguide](#commit-messages) for your commit messages.
- Send a pull request via Github.
  - Format your pull request as: [#issue_number] Your commit message (where issue_number is the issue you're closing)

#### Code Organization

Excalibur uses an AMD bundler using TypeScript to generate a browser self-bootstrapping bundle.

The Excalibur public API (i.e. `ex.*`) is defined in `src/engine/index.ts`. Any new classes or APIs that should be made available publicly should be exported there. The AMD bundler will then ensure the APIs or classes are exposed in the browser.

An example of exporting all public members from a new `MyClass.ts` that contains a `MyClass` ES6 class:

```ts
export * from './MyClass'
// ex.MyClass will be exposed
```

If the members should be aliased under a different name (namespaced) such as `ex.Feature.*`, you can import-export the members as a new name:

```ts
// ex.Feature namespace
import * as feature from './MyClass';
export { feature as Feature }
// ex.Feature.MyClass will be exposed
```

## Styleguides

#### Code
A number of our code formatting rules are enforced via linting. When you build Excalibur on your computer, the linter will make sure that certain aspects of your code are formatted properly. Additionally:
- Use 3 spaces for indenting
- All methods must explicitly specify their access modifier (public, private, etc.)
- Use the CamelCase naming convention, with a lowercase first letter for variables.

#### Commit Messages
Follow the guidelines below to help maintain a readable and informative git history:
- Use present tense verbs (“Fix bug where…” instead of “Fixed bug where…”)
- Use imperative mood (“Add new feature” instead of “Adds new feature”)
- Capitalize the first letter of the first line
- Limit the first line to 50 characters or less
- Separate the message subject from the rest of the commit with a blank line
- Limit lines in the message body to 72 characters or less
- Reference issue and pull request numbers as appropriate
- Use hyphens for bulleted lists
- If your change is small and simple, you may only need to write a single line commit message, e.x. “Fix typo in documentation”

Here are the rules applied in a sample commit message, along with some additional helpful hints:
```
Summarize what the commit does in <=50 characters

Here is where you would put additional context if you needed to explain
what your changes are doing in more detail. Lines in the body shouldn't
be more than 72 characters long. Don't forget to add a blank line
between the subject and the body!

Explain what problem this commit is solving. Why are you making this
change? Does your change introduce potential issues?

 - If you need a bulleted list, use hyphens
 - Here’s another item for the list

If you feel like you need another paragraph, go ahead and add one. Add
another blank line between each paragraph.

Referencing relevant issue and pull request numbers is very important
to help everyone understand what you're working on. Add them at the
bottom of your commit message.

Resolves: #100
See also: #200, #300
```
#### Tests
All features, changes, and bug fixes must be tested by specifications (unit tests). Write tests to cover any potential scenarios your code introduces.

Here’s an example:
```javascript
describe('a monkey', () => {
    it('climbs trees', () => {
        // put your spec here to show that monkeys climb trees
    });
    describe('when the monkey is hungry', () => {
        it('eats a banana', () => {
            // put your spec here to show that this is true
        });
    });
});
```

#### Documentation
- All public and protected methods need a JSDoc comment
- Link to other classes using the TypeDoc double bracket notation.

## Issue Labels
- [jump-in][search-label-jump-in]: issues that are good starting points for new contributors
- [help wanted][search-label-help wanted]: issues that are more in-depth and may require a certain platform or skillset to implement
- [bug][search-label-bug]: a problem or an unexpected behavior
- [api change][search-label-api change]: implementing an issue with this label will cause changes to the public API
- [feature][search-label-feature]: a brand new thing that Excalibur doesn’t have yet
- [enhancement][search-label-enhancement]: an improvement to an existing feature
- [optimization][search-label-optimization]: increasing performance, decreasing memory usage, etc.
- [extension][search-label-extension]: features that should exist outside of the core Excalibur library
- [tools][search-label-tools]: internal development and testing tools
- [docs][search-label-docs]: code, user, and external documentation of Excalibur
- [organization][search-label-organization]: re-organizing the repository structure, creating related repositories, etc.
- [on-deck][search-label-on-deck]: issues that are currently a higher priority than other backlog items
- [duplicate][search-label-duplicate]: closed because it is a duplicate of an existing issue
- [invalid][search-label-invalid]: an invalid issue that is not applicable to Excalibur development
- [wontfix][search-label-wontfix]: an issue that won’t be implemented



[forum]: https://groups.google.com/forum/#!forum/excaliburjs
[releases]: https://github.com/excaliburjs/Excalibur/releases
[issues]: https://github.com/excaliburjs/Excalibur/issues

[keep-a-changelog]: http://keepachangelog.com/en/0.3.0/

[search-label-jump-in]: https://github.com/excaliburjs/Excalibur/labels/jump-in
[search-label-help wanted]: https://github.com/excaliburjs/Excalibur/labels/help%20wanted
[search-label-bug]: https://github.com/excaliburjs/Excalibur/labels/bug
[search-label-api change]: https://github.com/excaliburjs/Excalibur/labels/api%20change
[search-label-feature]: https://github.com/excaliburjs/Excalibur/labels/feature
[search-label-enhancement]: https://github.com/excaliburjs/Excalibur/labels/enhancement
[search-label-optimization]: https://github.com/excaliburjs/Excalibur/labels/optimization
[search-label-extension]: https://github.com/excaliburjs/Excalibur/labels/extension
[search-label-tools]: https://github.com/excaliburjs/Excalibur/labels/tools
[search-label-docs]: https://github.com/excaliburjs/Excalibur/labels/docs
[search-label-organization]: https://github.com/excaliburjs/Excalibur/labels/organization
[search-label-on-deck]: https://github.com/excaliburjs/Excalibur/labels/on-deck
[search-label-duplicate]: https://github.com/excaliburjs/Excalibur/labels/duplicate
[search-label-invalid]: https://github.com/excaliburjs/Excalibur/labels/invalid
[search-label-wontfix]: https://github.com/excaliburjs/Excalibur/labels/wontfix
