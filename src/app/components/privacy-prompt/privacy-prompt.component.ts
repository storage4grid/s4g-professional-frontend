// ******** Angular Modules *********
import { Component, OnInit } from '@angular/core';

// ******** Angular Material *********
import { MatDialogRef } from '@angular/material';
import { MatCheckboxModule } from '@angular/material/checkbox';

/**
* Privacy information prompt to inform about data usage
*/
@Component({
  selector: 'app-privacy-prompt',
  templateUrl: './privacy-prompt.component.html'
})


export class PrivacyPromptComponent  {

  /**
  * checkbox for saving privacy agreement
  **/
  showPrivacyPrompt: boolean;

  constructor(public dialogRef: MatDialogRef<PrivacyPromptComponent>) {
    this.showPrivacyPrompt = true;
  }

  /**
  * Closes the privacy prompt
  * read checkbox value and write it to browser storage
  */
  agreeToPrivacy(): void {
    localStorage.setItem('S4GShowPrivacyPromptProfGui', JSON.stringify(this.showPrivacyPrompt));
    this.dialogRef.close( );
  }

}
