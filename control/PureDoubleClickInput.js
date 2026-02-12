sap.ui.define([
    "sap/m/Input",
    "sap/m/MessageToast",
    "sap/ui/core/Delegate"
], function (Input, MessageToast, Delegate) {
    "use strict";

    /**
     * Vegytiszta UI5 Custom Input control - dupla kattintás kezelés
     * Csak UI5 API-kat használ, natív JavaScript nélkül ahol lehetséges
     */
    return Input.extend("ui5.doubleclick.poc.control.PureDoubleClickInput", {

        metadata: {
            properties: {
                /**
                 * Időkorlát milliszekundumban két kattintás között
                 */
                clickTimeout: {
                    type: "int",
                    defaultValue: 500
                },
                /**
                 * Első kattintáskor megjelenő üzenet
                 */
                firstClickMessage: {
                    type: "string",
                    defaultValue: "Első kattintás - kattints még egyszer a szerkesztéshez"
                },
                /**
                 * Második kattintáskor megjelenő üzenet
                 */
                secondClickMessage: {
                    type: "string",
                    defaultValue: "Szerkeszthető mód aktiválva"
                }
            },
            events: {
                /**
                 * Dupla kattintás esemény
                 */
                doubleClick: {},

                /**
                 * Első kattintás esemény
                 */
                firstClick: {}
            }
        },

        init: function() {
            Input.prototype.init.apply(this, arguments);

            // Kezdeti állapot
            this.setEditable(false);

            // Click tracking változók
            this._clickCount = 0;
            this._lastClickTime = 0;

            // Style class hozzáadása
            this.addStyleClass("pureDoubleClickInput");

            // UI5 Delegate használata az események kezeléséhez
            this._setupEventDelegate();
        },

        /**
         * UI5 Delegate beállítása - vegytiszta UI5 megoldás
         */
        _setupEventDelegate: function() {
            var that = this;

            this._clickDelegate = {
                onclick: function(oEvent) {
                    that._handleClickEvent(oEvent);
                },

                onfocusout: function(oEvent) {
                    that._handleBlurEvent(oEvent);
                }
            };

            this.addEventDelegate(this._clickDelegate, this);
        },

        /**
         * Kattintás kezelése UI5 delegate-en keresztül
         */
        _handleClickEvent: function(oEvent) {
            // Ha már szerkeszthető, ne csináljunk semmit
            if (this.getEditable()) {
                return;
            }

            var currentTime = Date.now();
            var timeDiff = currentTime - this._lastClickTime;

            // Timeout ellenőrzés
            if (timeDiff > this.getClickTimeout()) {
                this._clickCount = 0;
            }

            this._clickCount++;
            this._lastClickTime = currentTime;

            if (this._clickCount === 1) {
                this._handleFirstClick();
            } else if (this._clickCount >= 2) {
                this._handleSecondClick();
            }
        },

        /**
         * Első kattintás kezelése
         */
        _handleFirstClick: function() {
            // Visual feedback
            this.addStyleClass("sapUiHighlight");

            // Toast üzenet
            MessageToast.show(this.getFirstClickMessage());

            // Event tüzelése
            this.fireFirstClick();

            // Reset időzítés UI5 Core delayed call-lal (natív setTimeout helyett)
            var that = this;
            sap.ui.core.Core.prototype.delayedCall(
                this.getClickTimeout(),
                this,
                function() {
                    that._resetClickState();
                }
            );
        },

        /**
         * Második kattintás kezelése
         */
        _handleSecondClick: function() {
            // Style osztályok módosítása
            this.removeStyleClass("sapUiHighlight");
            this.addStyleClass("sapUiEdit");

            // Szerkeszthetővé tétel
            this.setEditable(true);

            // Toast üzenet
            MessageToast.show(this.getSecondClickMessage());

            // Fókusz beállítása UI5 delayed call-lal
            var that = this;
            sap.ui.core.Core.prototype.delayedCall(50, this, function() {
                that.focus();
                // Szöveg kijelölése
                that.selectText(0, that.getValue().length);
            });

            // Click számláló reset
            this._clickCount = 0;

            // Event tüzelése
            this.fireDoubleClick();
        },

        /**
         * Blur esemény kezelése
         */
        _handleBlurEvent: function(oEvent) {
            if (this.getEditable()) {
                // Vissza read-only módba
                this.setEditable(false);
                this.removeStyleClass("sapUiEdit");
            }
        },

        /**
         * Click állapot reset
         */
        _resetClickState: function() {
            this._clickCount = 0;
            this.removeStyleClass("sapUiHighlight");
        },

        /**
         * Cleanup
         */
        exit: function() {
            if (this._clickDelegate) {
                this.removeEventDelegate(this._clickDelegate);
                this._clickDelegate = null;
            }

            Input.prototype.exit.apply(this, arguments);
        },

        renderer: {} // Alapértelmezett Input renderer használata
    });
});
