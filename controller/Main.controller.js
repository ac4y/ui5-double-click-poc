sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "ui5/doubleclick/poc/control/DoubleClickInput"
], function (Controller, MessageToast, DoubleClickInput) {
    "use strict";

    return Controller.extend("ui5.doubleclick.poc.controller.Main", {

        onInit: function() {
            // Click tracking object for each input field
            this._clickTracking = {};
            this._clickTimeout = 500; // milliseconds to reset click count

            // Create custom double-click inputs
            this._createCustomInputs();
        },

        _createCustomInputs: function() {
            var oView = this.getView();
            var oVBox = oView.byId("__xmlview0--vbox1"); // You may need to adjust this ID

            // Create first custom input
            var oCustomInput1 = new DoubleClickInput("customInput1", {
                value: "Kattints kétszer!",
                placeholder: "Dupla kattintás a szerkesztéshez",
                width: "300px"
            });

            // Create second custom input
            var oCustomInput2 = new DoubleClickInput("customInput2", {
                value: "Második példa",
                placeholder: "Védett mező",
                width: "300px"
            });

            // Add to the page - we'll do this in a different way
            // For now, let's focus on the table-based approach
        },

        onInputPress: function(oEvent) {
            var oInput = oEvent.getSource();
            var sInputId = oInput.getId();

            // Initialize click tracking for this input if not exists
            if (!this._clickTracking[sInputId]) {
                this._clickTracking[sInputId] = {
                    count: 0,
                    timeout: null
                };
            }

            var oTracking = this._clickTracking[sInputId];

            // Clear any existing timeout
            if (oTracking.timeout) {
                clearTimeout(oTracking.timeout);
            }

            // Increment click count
            oTracking.count++;

            if (oTracking.count === 1) {
                // First click - just highlight/select the row
                MessageToast.show("Első kattintás - mező kijelölve");
                oInput.addStyleClass("sapUiHighlight");

                // Set timeout to reset count
                oTracking.timeout = setTimeout(function() {
                    oTracking.count = 0;
                    oInput.removeStyleClass("sapUiHighlight");
                }, this._clickTimeout);

            } else if (oTracking.count === 2) {
                // Second click - make editable
                MessageToast.show("Második kattintás - szerkeszthető!");
                oInput.setEditable(true);
                oInput.removeStyleClass("sapUiHighlight");
                oInput.addStyleClass("sapUiEdit");

                // Focus the input for immediate editing
                setTimeout(function() {
                    oInput.focus();
                }, 100);

                // Reset click count
                oTracking.count = 0;
                clearTimeout(oTracking.timeout);

                // When focus is lost, make it read-only again
                oInput.attachBrowserEvent("blur", function() {
                    oInput.setEditable(false);
                    oInput.removeStyleClass("sapUiEdit");
                });
            }
        },

        getRowIndex: function(oContext) {
            // This is a helper to get row index if needed
            return oContext;
        }
    });
});
