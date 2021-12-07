# HestiaLabs Experiences

The experiences developed by HestiaLabs are targeted for any user willing to better understand their personal data. It takes the form of an easy-to-use web app that locally processes the raw personal data downloaded from various sources (Twitter, Facebook, Uber, etc) and creates meaningful visualizations.

## Instances

The instances are deployed on [netlify](https://app.netlify.com/teams/hestia/overview), where you can see a log of their [build](https://app.netlify.com/teams/hestia/builds/). They each point to a different branch of this repo.

|                    | [test.hestialabs.org](https://test.hestialabs.org/)                                  | [experiences.hestialabs.org](https://experiences.hestialabs.org/)          | [digipower.hestialabs.org](https://digipower.hestialabs.org/)                                  | [tfac.hestialabs.org](https://tfac.hestialabs.org/)                                  |
| :----------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| branch             | [netlify-test](https://github.com/hestiaAI/hestialabs-experiences/tree/netlify-test) | [netlify](https://github.com/hestiaAI/hestialabs-experiences/tree/netlify) | [netlify-digipower](https://github.com/hestiaAI/hestialabs-experiences/tree/netlify-digipower) | [netlify-tfac](https://github.com/hestiaAI/hestialabs-experiences/tree/netlify-tfac) |
| netlify name       | test-experiences                                                                     | hestia-experiences                                                         | digipower                                                                                      | tfac                                                                                 |
| purpose            | testing, typically with all features and experiences enabled                         | our public showcase                                                        | the sitra project                                                                              | a tool for the [Tracking-Free Ads Coalition](https://trackingfreeads.eu/)            |
| config             | `config/config.json`                                                                 | `config/workshop.json`                                                     | `config/digipower.json`                                                                        | `config/tfac.json`                                                                   |
| running it locally | `npm run dev`                                                                        | `CONFIG_NAME=workshop npm run dev`                                         | `CONFIG_NAME=digipower npm run dev`                                                            | `CONFIG_NAME=tfac npm run dev`                                                       |

## For developers

### Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

### Global Configuration

The files in `config` let us set parameters for each deployment. [See the README](https://github.com/hestiaAI/hestialabs-experiences/tree/master/config) for more details about the different parameters.

The default is `config/config.json` (the test deployment), but if you want to use another configuration like `config/workshop.json`, set the environment variable **CONFIG_NAME**

```bash
# for development
$ CONFIG_NAME=workshop npm run dev
```

```bash
# for production
$ CONFIG_NAME=workshop BASE_URL=experiences.hestialabs.org npm run build
# launch server
$ npm run start
```

### Structure

The app follows the default structure of Nuxt, [see the docs](https://nuxtjs.org/docs/get-started/directory-structure) for more details about the different directories.

### Testing

```bash
# Run all the tests
$ npm run test

# Update snapshots
$ npm run test -- -u

# Update snapshots interactively
$ npm run test -- -i
```

(More fine-grained options are available [in the docs](https://jestjs.io/docs/cli))

Tests are run with the [Jest](https://jestjs.io/) framework. There are currently three types of tests that can be written.

#### Unit tests

Unit tests for `.js` files can be written using Jest. An example is available in [utils/csv.test.js](https://github.com/hestiaAI/hestialabs-experiences/blob/master/utils/csv.test.js).

#### Component unit tests

Unit tests on components can be written with the help of Jest and [Vue test utils](https://vue-test-utils.vuejs.org/). An example is available in [components/unit/filterable-table/\_\_tests\_\_/UnitFilterableTable.test.js](https://github.com/hestiaAI/hestialabs-experiences/blob/master/components/unit/filterable-table/__tests__/UnitFilterableTable.test.js). It shows how to mount a component, mock the vuex store, and find specific HTML elements.

Please follow the same naming convention: create a `__tests__` folder at the same level as the tested component, and name the test file `ComponentName.test.js`.

#### Snapshot tests

Snapshot tests can be written to check that the HTML content of a component hasn't changed, by comparing it to a string saved in the `__snapshots__` folder. If the changes are intentional, snapshots can be updated with the command above.

An example is available in [components/unit/filterable-table/\_\_tests\_\_/UnitFilterableTable.test.js](https://github.com/hestiaAI/hestialabs-experiences/blob/master/components/unit/filterable-table/__tests__/UnitFilterableTable.test.js)

Note that snapshots do not include Vue props or data, and that child components are not recursively rendered as HTML (e.g. a component `BaseButton` will appear as an HTML tag `<basebutton>`).

### Upgrading npm on Windows

This is only relevant for Windows users who work with nvm.

We work with a version of npm more recent than the one shipped with the node LTS we are using. There is a standard way of upgrading npm, but it doesn't work with nvm-windows. The way to do it is described in this [comment on github](https://github.com/coreybutler/nvm-windows/issues/300#issuecomment-798776683):

- download [this](https://gist.github.com/nokidding/aafaf90adc80cbce54b676340817bb13) as updateNpm.bat file
- open powershell in that same folder and run this command ./updateNpm.bat latest
