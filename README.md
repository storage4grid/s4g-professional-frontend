# S4gProfessional

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Dependencies
Nodejs 8
Npm 6

## Getting started
run `npm install` to get all libraries
run the development server with `ng serve --open` (--opem will open the page in the browser)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Documentation

We use Compodoc (https://compodoc.app/) to create our documentation.

To create the documentation in the projects root folder run
`npm run compodoc`

To serve the documentation in the projects root folder run

`compodoc -s`

and point your browser to http://127.0.0.1:8080

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Sass and CSS
The files `src/assets/css/s4g-theme.min.css` and `src/assets/css/styles.min.css` are generated. Please, do not mess with them :)

`src/assets/css/s4g-theme.min.css` contains the S4G color theme used by Angular Material. In order to change something here, adjust `sass/s4g-theme.scss` and compile running `gulp material-theme`

All styles compiled under `src/assets/css/styles.min.css` can be found in the respective partials in the `sass` folder. To compile these just run `gulp`, this will also start a watch task that will monitor any further changes.

### Naming convention

For CSS class names we use the BEM naming convention http://getbem.com/naming/




