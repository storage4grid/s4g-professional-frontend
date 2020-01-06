// ******** Angular Modules *********
import { Component, OnInit, EventEmitter, Output } from '@angular/core';

// ******** Settings *********
import { AppSettings } from '../../app-config';

/**
 * Toolbox containing all tools for creating and selecting grid elements
 */
@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {
  /**
   * String identifier for the currently selected tool
   */
  activeTool: String;

  /**
   * Available tools
   */
  tools: any;

  /**
   * EventEmitter to notify the parent component a tool has been selected
   */
  @Output() toolSelection = new EventEmitter<String>();

  constructor() {
    this.tools = AppSettings.TOOLS;
    this.activeTool = this.tools.explore;
  }

  /*
   * Angular Lifecycle Hook.
   * Called once
   * Initialize the directive/component after Angular first displays the data-bound properties
   * and sets the directive/component's input properties.
   */
  ngOnInit() {}

  /**
   * Activate a tool, called when the user click on a tool in the toolbox
   *
   * @param tool - textual identifier for the selected tool
   */
  activateTool(tool: String) {
    this.toolSelection.emit(tool);
    this.activeTool = tool;
  }
}
