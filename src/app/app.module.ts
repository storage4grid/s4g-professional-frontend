// ******** Angular Modules *********
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { XHRBackend, RequestOptions } from '@angular/http';

// ******* Keycloak *********
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializer } from './app-init';

// ******* Routing *********
import { AppRoutingModule } from './app-routing.module';

// ******** Components *********
import { AppComponent } from './app.component';

import {
  MapComponent,
  PrivacyPromptComponent,
  SimulationWidgetComponent,
  ToolbarComponent,
  ToolboxComponent,
  UserSettingsComponent,
  SearchbarComponent,
  ErrorPageComponent,
  StoragePopupComponent,
  PvPopupComponent,
  EvPopupComponent
} from './components';

// ******** Guards *********
import { AuthGuard } from './guards/index';

// ******** Leaflet *********
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';

// ******** Angular Material modules *********
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MatToolbarModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatSliderModule
} from '@angular/material';

import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import { GridService } from './services/grid.service';
import { DbService } from './services/db.service';

/**
 * This is the main app module
 */
@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    PrivacyPromptComponent,
    SimulationWidgetComponent,
    ToolbarComponent,
    ToolboxComponent,
    UserSettingsComponent,
    SearchbarComponent,
    StoragePopupComponent,
    ErrorPageComponent,
    PvPopupComponent,
    EvPopupComponent
  ],
  entryComponents: [
    PrivacyPromptComponent,
    StoragePopupComponent,
    PvPopupComponent,
    EvPopupComponent
  ],
  imports: [
    CommonModule,

    // Leaflet
    LeafletModule,
    LeafletMarkerClusterModule,

    // angular modules
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    // Keycloak
    KeycloakAngularModule,

    // Angular Material modules
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatSliderModule,

    // internal modules
    AppRoutingModule
  ],
  providers: [
    AuthGuard,
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      multi: true,
      deps: [KeycloakService]
    },
    GridService,
    DbService,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
