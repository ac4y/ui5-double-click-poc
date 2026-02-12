sap.ui.define([
    "sap/m/Input",
    "sap/m/MessageToast"
], function (Input, MessageToast) {
    "use strict";

    /**
     * Custom Input control that requires double-click to become editable
     */
    return Input.extend("ui5.doubleclick.poc.control.DoubleClickInput", {

        metadata: {
            properties: {
                // Inherit all Input properties
            },
            events: {
                doubleClick: {}
            }
        },

        init: function() {
            Input.prototype.init.apply(this, arguments);

            // Set initial state to non-editable
            this.setEditable(false);

            // Click tracking
            this._clickCount = 0;
            this._clickTimeout = null;
            this._timeoutDuration = 500; // ms

            // Add custom style class
            this.addStyleClass("doubleClickInput");
        },

        onAfterRendering: function() {
            Input.prototype.onAfterRendering.apply(this, arguments);

            // Attach click handler to the input's DOM
            var oDomRef = this.getDomRef();
            if (oDomRef) {
                oDomRef.addEventListener("click", this._handleClick.bind(this));
            }
        },

        _handleClick: function(oEvent) {
            // Prevent default if not editable
            if (!this.getEditable()) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }

            // Clear existing timeout
            if (this._clickTimeout) {
                clearTimeout(this._clickTimeout);
            }

            // Increment click count
            this._clickCount++;

            if (this._clickCount === 1) {
                // First click - visual feedback
                this.addStyleClass("sapUiHighlight");
                MessageToast.show("Első kattintás - kattints még egyszer a szerkesztéshez");

                // Set timeout to reset
                this._clickTimeout = setTimeout(function() {
                    this._clickCount = 0;
                    this.removeStyleClass("sapUiHighlight");
                }.bind(this), this._timeoutDuration);

            } else if (this._clickCount === 2) {
                // Second click - make editable
                this.setEditable(true);
                this.removeStyleClass("sapUiHighlight");
                this.addStyleClass("sapUiEdit");
                MessageToast.show("Szerkeszthető mód");

                // Focus the input
                setTimeout(function() {
                    this.focus();
                    // Select all text for easy editing
                    var oDomRef = this.getDomRef("inner");
                    if (oDomRef && oDomRef.select) {
                        oDomRef.select();
                    }
                }.bind(this), 50);

                // Reset click count
                this._clickCount = 0;
                clearTimeout(this._clickTimeout);

                // Fire custom event
                this.fireDoubleClick();

                // Attach blur handler to make it read-only again
                this.attachBrowserEvent("blur", this._handleBlur.bind(this));
            }
        },

        _handleBlur: function() {
            // When focus is lost, revert to read-only
            this.setEditable(false);
            this.removeStyleClass("sapUiEdit");
            this.detachBrowserEvent("blur", this._handleBlur);
        },

        renderer: {} // Use default Input renderer
    });
});
