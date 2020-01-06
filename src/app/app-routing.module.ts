// ******** Angular Modules *********
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ******** Router *********
import { AuthGuard } from './guards/index';

// ******** Components *********
import { MapComponent, UserSettingsComponent } from './components/index';
import { ErrorPageComponent } from './components/error-page/error-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  {
    path: 'map',
    component: MapComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['redirect_to_default_location']
    }
  },
  {
    path: 'map/:location',
    component: MapComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['redirect_to_location']
    }
  },
  {
    path: 'settings',
    component: UserSettingsComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
