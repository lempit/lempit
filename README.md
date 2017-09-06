# lempit

> A simple CLI project scaffolder similar to [Khaos](https://github.com/segmentio/khaos).

## Installation

Prerequisites: [node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/get-npm) and [git](https://git-scm.com/).

``` bash
$ npm install -g lempit
```

## Usage

``` bash
$ lempit init <template-name> <project-name> [options]
```

### template-name
Git repository or local folder that contains project template. To create project from [`https://github.com/lempit/koa-typescript`](https://github.com/lempit/koa-typescript) you can simply specify `lempit/koa-typescript` as the `template-name`. For other repositories other than Github you have to specify the name of the repository in front of template directory:

**GitHub** - `github:owner/template-name` or `simply owner/template-name`

**GitLab** - `gitlab:owner/template-name`

**Bitbucket** - `bitbucket:owner/template-name`

### project-name
The name of project.

### options
-c, --clean  clean target directory

-h, --help   output usage information


## Example

``` bash
$ lempit init lempit/koa-typescript my-project
```


## Template
**Lempit** works like [Khaos](https://github.com/segmentio/khaos) to make a template you just need to create files filled with mustache template tags and put it under directory named `template`. Take a look at [`https://github.com/lempit/koa-typescript`](https://github.com/lempit/koa-typescript) for example.

A [Khaos](https://github.com/segmentio/khaos) template should be works too for **Lempit**.


## License
[MIT](https://github.com/lempit/lempit/blob/master/LICENSE)