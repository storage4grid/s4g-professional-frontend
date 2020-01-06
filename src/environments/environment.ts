// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  keycloakRootUrl: 'https://auth.fit.fraunhofer.de/kc',

  hostname: 'localhost',
  port: 5000,

  seHostname: 'localhost',
  sePort: 9090,

  professHostname: 'enton.fit.fraunhofer.de',
  professPort: 8080,

  eeHostname: 'dwh.storage4grid.eu',
  eePort: 9082
};
