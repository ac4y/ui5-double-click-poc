sap.ui.define([
    "sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
    "use strict";

    new ComponentContainer({
        name: "ui5.doubleclick.poc",
        settings: {
            id: "doubleClickPoc"
        },
        async: true
    }).placeAt("content");
});
