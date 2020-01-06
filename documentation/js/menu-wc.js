'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">s4g-professional documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="dependencies.html" data-type="chapter-link">
                                <span class="icon ion-ios-list"></span>Dependencies
                            </a>
                        </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse" ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' : 'data-target="#xs-components-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' :
                                            'id="xs-components-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MapComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MapComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrivacyPromptComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PrivacyPromptComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchbarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SearchbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SimulationWidgetComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SimulationWidgetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ToolbarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ToolbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ToolboxComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ToolboxComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UserSettingsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' : 'data-target="#xs-injectables-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' :
                                        'id="xs-injectables-links-module-AppModule-ea575693b2684d39697845c7ca620f64"' }>
                                        <li class="link">
                                            <a href="injectables/AuthGuard.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthGuard</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GridService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>GridService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppRoutingModule-dfb70602367205ce09e958a06690d14e"' : 'data-target="#xs-injectables-links-module-AppRoutingModule-dfb70602367205ce09e958a06690d14e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppRoutingModule-dfb70602367205ce09e958a06690d14e"' :
                                        'id="xs-injectables-links-module-AppRoutingModule-dfb70602367205ce09e958a06690d14e"' }>
                                        <li class="link">
                                            <a href="injectables/AuthGuard.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthGuard</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/MapComponent.html" data-type="entity-link">MapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivacyPromptComponent.html" data-type="entity-link">PrivacyPromptComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SimulationWidgetComponent.html" data-type="entity-link">SimulationWidgetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ToolbarComponent.html" data-type="entity-link">ToolbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ToolboxComponent.html" data-type="entity-link">ToolboxComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserSettingsComponent.html" data-type="entity-link">UserSettingsComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AppSettings.html" data-type="entity-link">AppSettings</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthGuard.html" data-type="entity-link">AuthGuard</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ConnectedElement.html" data-type="entity-link">ConnectedElement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConnectedElements.html" data-type="entity-link">ConnectedElements</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Elements.html" data-type="entity-link">Elements</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Grid.html" data-type="entity-link">Grid</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridElements.html" data-type="entity-link">GridElements</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridElementsLayer.html" data-type="entity-link">GridElementsLayer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridLayer.html" data-type="entity-link">GridLayer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/House.html" data-type="entity-link">House</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Houses.html" data-type="entity-link">Houses</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Icons.html" data-type="entity-link">Icons</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Linecode.html" data-type="entity-link">Linecode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Linecodes.html" data-type="entity-link">Linecodes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Location.html" data-type="entity-link">Location</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MarkerLayer.html" data-type="entity-link">MarkerLayer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Node.html" data-type="entity-link">Node</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodeLayer.html" data-type="entity-link">NodeLayer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Nodes.html" data-type="entity-link">Nodes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PV.html" data-type="entity-link">PV</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PVs.html" data-type="entity-link">PVs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Radial.html" data-type="entity-link">Radial</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Radials.html" data-type="entity-link">Radials</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Storage.html" data-type="entity-link">Storage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Storages.html" data-type="entity-link">Storages</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transformer.html" data-type="entity-link">Transformer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transformers.html" data-type="entity-link">Transformers</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});