![Logo](/assets/logo.png?raw=true)

[![Build Status](https://img.shields.io/travis/excaliburjs/Excalibur/master.svg)](https://travis-ci.org/excaliburjs/Excalibur)
[![Build status](https://img.shields.io/appveyor/ci/eonarheim/excalibur/master.svg)](https://ci.appveyor.com/project/eonarheim/excalibur)
[![npm version](https://img.shields.io/npm/v/excalibur.svg)](https://www.npmjs.com/package/excalibur)
[![npm downloads](https://img.shields.io/npm/dt/excalibur.svg)](https://www.npmjs.com/package/excalibur)
[![Bower version](https://img.shields.io/bower/v/excalibur.svg)](https://github.com/excaliburjs/Excalibur)
[![NuGet version](https://img.shields.io/nuget/v/Excalibur.svg)](https://www.nuget.org/packages/Excalibur/)
[![Docs status](https://readthedocs.org/projects/excaliburjs/badge/?version=latest)](http://excaliburjs.readthedocs.org/en/latest/?badge=latest)



![Sweep Stacks](http://excaliburjs.com/assets/images/homepage-xp.png)

Excalibur is a simple, **free** game engine written in TypeScript for making 2D games in HTML5 canvas. Our goal is to make it *incredibly simple* to create 2D HTML/JS games, for folks new to game development as well as experienced game developers. We take care of all of the boilerplate engine code, cross-platform targeting, and more so you don't have to. Use as much or as little as you need!

Excalibur is an open source project licensed under the 2-clause BSD license (this means you can use it in commercial projects!). It's free and always will be. We welcome any feedback or contributions! If you make something with Excalbur, please [let us know](https://groups.google.com/forum/#!tags/excaliburjs/show-and-tell)!

# Get Started

Our user documentation is at http://docs.excaliburjs.com.

- Follow our [Installation](http://docs.excaliburjs.com/en/latest/installation.html) guide to learn how to install Excalibur
- Follow our [Getting Started](http://docs.excaliburjs.com/en/latest/quickstart.html) guide if you're looking to get started.
- Learn what [Features](http://docs.excaliburjs.com/en/latest/features.html) are available for you to leverage in your games
- View the [Release roadmap](https://github.com/excaliburjs/Excalibur/milestones) to see what's coming next

:exclamation: ***Note:*** We are still in version 0.x, which means this project may be a little rough around the edges. We try to minimize API changes, but breaking changes **will occur** in new released versions. Excalibur is a labor of love and the product of many hours of spare time. Thanks for checking it out!

# API Documentation

Visit the [API Documentation](http://docs.excaliburjs.com/en/latest/index.html#api-documentation) section for fully-annotated documentation of the API.

The `master` branch documentation is always available and up-to-date on our [Edge documentation site](http://excaliburjs.com/docs/api/edge).

# Questions

- :grey_question: Ask us anything in the [Excalibur.js forum](https://groups.google.com/forum/#!forum/excaliburjs)
- :bug: If you find a bug, report it on the [GitHub issues page](https://github.com/excaliburjs/Excalibur/issues) (please review our [guidelines for reporting bugs](https://github.com/excaliburjs/Excalibur/blob/master/.github/CONTRIBUTING.md#reporting-bugs)).
- :mega: You can also follow us on Twitter [@excaliburjs](http://twitter.com/excaliburjs) or [read the blog](http://blog.excaliburjs.com).

# Samples

Compiled examples can be found [in the Excalibur Samples collection](http://excaliburjs.com/samples/).

# Contributing

Please read the [Contributing guidelines](.github/CONTRIBUTING.md). Whether you've spotted a bug, have a question, or think of a good feature, we thank you for your help!

## Environment Setup

The Excalibur.js team primarily uses [Visual Studio Code](http://code.visualstudio.com) as a platform agnostic editor to
allow the widest contributions possible. You can always use your own preferred editor of choice.

### Prerequisites

- **Required:** [Node.js](https://nodejs.org/) & npm (8.x)
- *Recommended:* [TSLint extension for VS Code](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)
- *Optional:* [PhantomJS Debugger for VS Code](https://github.com/iradul/vscode-phantomjs-debug)
- *Optional:* Grunt CLI (`npm i -g grunt-cli`), same task names

After cloning the repository, run:

```sh
npm install
```

You can then run the npm tasks for various purposes:

```bash
# Run compilation, linting, and all unit & visual tests
# Recommend to do this before finalizing pull requests
npm run all

# Run engine core compilation only
# Useful for quick checks to ensure everything compiles
npm run compile

# Run engine tests only (does not run compile task)
# Useful to run tests ad-hoc
npm run tests

# Compile HTML visual tests
# Useful to ensure HTML sandbox compiles
npm run visual

# Start sandbox dev server (long-running)
# Run in separate terminal alongside `npm run visual`
npm run sandbox

# Compile API docs
npm run apidocs
```

# License

Excalibur is open source and operates under the 2-clause BSD license:

	BSD 2-Clause License

	Copyright (c) 2014, Erik Onarheim
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	* Redistributions of source code must retain the above copyright notice, this
	  list of conditions and the following disclaimer.

	* Redistributions in binary form must reproduce the above copyright notice,
	  this list of conditions and the following disclaimer in the documentation
	  and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
	FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
	OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
