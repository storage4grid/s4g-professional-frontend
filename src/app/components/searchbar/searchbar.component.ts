import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { AppSettings } from '../../app-config';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

export interface Location {
  name: string;
}

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit {
  @Input() errorMessage: string;

  /* Search Form */

  searchTerm: string;

  myControl = new FormControl();
  options: Location[] = Object.keys(AppSettings.LOCATIONS).map(location => ({
    name: location
  }));
  filteredOptions: Observable<Location[]>;

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith<string | Location>(''),
      map(value => (typeof value === 'string' ? value : value.name)),
      map(name => (name ? this._filter(name) : this.options.slice()))
    );
  }

  displayFn(location?: Location): string | undefined {
    return location ? location.name : undefined;
  }

  private _filter(name: string): Location[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(
      option => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  onSearch(method) {
    const location =
      method === 'submit' ? this.myControl.value : this.myControl.value.name;
    this.router.navigate(['map', location.toLowerCase()]);
  }
}
