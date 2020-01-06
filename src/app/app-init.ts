import { KeycloakService } from 'keycloak-angular';

// ******** Environment *********
import { environment } from '../environments/environment';

/**
* Initialize the keycloak service
*/
export function initializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: {
            url: environment.keycloakRootUrl,
            realm: 'S4G-dev',
            clientId: 's4g_client'
          },
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: true,
            refreshToken: '',
            flow: 'standard'
          },
          enableBearerInterceptor: true,
          bearerExcludedUrls: [
            '/assets',
            '/clients/public'
          ],
        });
        resolve();
      } catch (error) {}
    });
  };
}
