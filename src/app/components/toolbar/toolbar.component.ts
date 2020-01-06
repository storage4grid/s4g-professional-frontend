// ******** Angular Modules *********
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// ******** Services *********
import { KeycloakService } from 'keycloak-angular';

/**
 * Toolbar displayed on top of the app
 */
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  currentPage = 'map';

  userDetails: any = {
    username: '' // initialize so it wont cause an error while loading data from keycloak
  };

  userRole = ''; // quick hack, remove once we have adapted to new lib

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private keycloakService: KeycloakService
  ) {}

  /*
   * Angular Lifecycle Hook.
   * Called once
   * Initialize the directive/component after Angular first displays the data-bound properties
   * and sets the directive/component's input properties.
   */
  async ngOnInit() {
    // get the user details from keycloak and store them locally
    this.userDetails = await this.keycloakService.loadUserProfile();

    // check the userRole
    if (
      this.keycloakService.getUserRoles().find(function(value, index, obj) {
        return value === 'grid_planner';
      })
    ) {
      this.userRole = 'grid_planner';
    }
  }

  /**
   * Navigate to the user settings page
   */
  viewSettings() {
    this.currentPage = 'settings';
    this.router.navigate(['settings']);
  }

  /**
   * Navigate to the map page
   */
  viewMap() {
    this.currentPage = 'map';
    this.router.navigate(['map']);
  }

  /**
   * Log the current user out
   */
  logout() {
    localStorage.removeItem('prof_gui');
    this.keycloakService.logout();
  }
}
