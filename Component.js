sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("ui5.doubleclick.poc.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // Create data model
            var oModel = new JSONModel({
                items: [
                    { name: "Első elem", value: "100", description: "Első kattintásra kijelölés, másodikra szerkesztés" },
                    { name: "Második elem", value: "200", description: "Védett mező dupla kattintással" },
                    { name: "Harmadik elem", value: "300", description: "Tesztelési példa" }
                ]
            });
            this.setModel(oModel);

            this.getRouter().initialize();
        }
    });
});
