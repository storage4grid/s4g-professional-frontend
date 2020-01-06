import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ResolveEnd
} from '@angular/router';

// ******** Services *********
import { KeycloakService, KeycloakAuthGuard } from 'keycloak-angular';

/**
 * Prevents unauthorized users from accessing restricted routes
 */
@Injectable()
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected router: Router,
    protected keycloakAngular: KeycloakService
  ) {
    super(router, keycloakAngular);
  }

  isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!this.authenticated) {
        this.keycloakAngular.login();
        return;
      }

      const requiredRoles = route.data.roles;

      if (!requiredRoles || requiredRoles.length === 0) {
        return resolve(true);
      } else {
        if (!this.roles || this.roles.length === 0) {
          resolve(false);
        }

        let granted = false;
        let redirect = false;
        let errorMessage = 'Page/Location not found';

        for (const requiredRole of requiredRoles) {
          if (this.roles.indexOf(requiredRole) > -1) {
            granted = true;
            break;
          }
        }

        if (requiredRoles.includes('redirect_to_default_location')) {
          redirect = true;

          if (this.roles.includes('fur')) {
            this.router.navigate(['/map/fur']);
          } else if (this.roles.includes('bolzano')) {
            this.router.navigate(['/map/bolzano']);
          }

          resolve(true);
        }

        if (requiredRoles.includes('redirect_to_location')) {
          const { location } = route.params;

          if (this.roles.includes(location)) {
            granted = true;
          } else {
            errorMessage = `Not authorized to visit grid of ${location}`;
          }
        }

        if (granted === false && redirect === false) {
          this.router.navigate(['/error'], { queryParams: { errorMessage } });
          resolve(true);
        }

        resolve(granted);
      }
    });
  }
}
