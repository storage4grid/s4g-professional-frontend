// ******** Angular Modules *********
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// ******** Services *********
import { KeycloakService } from 'keycloak-angular';

/**
 * Component for displaying and changing the user settings
 */
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  /**
   * User profile data for the current user
   */
  currentUserProfile: any = {
    firstName: '',
    lastName: '',
    email: ''
  };

  /**
   * Account UTL for keycloak account
   */
  accountUrl: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private keycloak: KeycloakService
  ) {}

  /*
   * Angular Lifecycle Hook.
   * Called once
   * Initialize the directive/component after Angular first displays the data-bound properties
   * and sets the directive/component's input properties.
   */
  ngOnInit() {
    this.accountUrl = this.keycloak.getKeycloakInstance().createAccountUrl();

    this.keycloak
      .loadUserProfile()
      .then(profile => {
        this.currentUserProfile = profile;
      })
      .catch(function(e) {
        console.log('Failed to load user profile');
        console.error(e);
      });
  }

  /**
   * Save the changed settings
   */
  saveSettings() {
    this.router.navigate(['map']);
  }

  /**
   * Redirects to Keycloak to change account settings
   */
  changeAccountSettings() {
    window.location.href = this.accountUrl;
  }
}
