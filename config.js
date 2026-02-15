/**
 * UI5 Bootstrap konfiguráció - környezet-váltó
 *
 * Használat:
 *   ?env=cdn       → SAPUI5 CDN (alapértelmezett)
 *   ?env=local     → Lokális ui5 serve (framework cache)
 *   ?env=backend   → Backend szerver direkt (CORS lehet probléma!)
 *   ?env=hybrid    → Backend szerver proxy-n keresztül (CORS-mentes)
 *
 * A kiválasztott környezet a sessionStorage-ban tárolódik,
 * így oldalfrissítéskor megmarad.
 */
(function () {
    "use strict";

    var UI5_CONFIGS = {
        cdn: {
            name: "CDN (SAPUI5 1.105.0)",
            url: "https://ui5.sap.com/1.105.0/resources/sap-ui-core.js",
            description: "SAPUI5 CDN - fix verzió, internet szükséges"
        },
        local: {
            name: "Local (ui5 serve)",
            url: "resources/sap-ui-core.js",
            description: "Lokális UI5 CLI serve - offline működik"
        },
        backend: {
            name: "Backend (direkt)",
            url: "http://192.168.1.10:9000/resources/sap-ui-core.js",
            description: "Backend szerver közvetlenül - CORS probléma lehet!"
        },
        hybrid: {
            name: "Hybrid (backend proxy)",
            url: "/proxy/resources/sap-ui-core.js",
            description: "Backend szerver proxy-n keresztül - CORS-mentes"
        }
    };

    var DEFAULT_ENV = "cdn";

    /**
     * Aktuális környezet meghatározása:
     *  1. URL paraméter (?env=xxx) - legmagasabb prioritás
     *  2. sessionStorage - előző választás megmarad
     *  3. DEFAULT_ENV - fallback
     */
    function getEnvironment() {
        var urlParams = new URLSearchParams(window.location.search);
        var envParam = urlParams.get("env");

        if (envParam && UI5_CONFIGS[envParam]) {
            sessionStorage.setItem("ui5_env", envParam);
            return envParam;
        }

        var stored = sessionStorage.getItem("ui5_env");
        if (stored && UI5_CONFIGS[stored]) {
            return stored;
        }

        return DEFAULT_ENV;
    }

    /**
     * UI5 bootstrap script dinamikus betöltése
     */
    function loadUI5(onInit) {
        var env = getEnvironment();
        var config = UI5_CONFIGS[env];

        console.log("[UI5 Bootstrap] Environment: " + config.name);
        console.log("[UI5 Bootstrap] URL: " + config.url);

        var script = document.createElement("script");
        script.id = "sap-ui-bootstrap";
        script.src = config.url;
        script.setAttribute("data-sap-ui-theme", "sap_horizon");
        script.setAttribute("data-sap-ui-libs", "sap.m");
        script.setAttribute("data-sap-ui-async", "true");
        script.setAttribute("data-sap-ui-compatVersion", "edge");
        script.setAttribute("data-sap-ui-resourceroots", JSON.stringify({
            "ui5.doubleclick.poc": "./"
        }));

        if (typeof onInit === "string") {
            script.setAttribute("data-sap-ui-onInit", onInit);
        }

        script.onerror = function () {
            console.error("[UI5 Bootstrap] Failed to load: " + config.url);
            document.getElementById("content").innerHTML =
                '<div style="padding:2rem;color:#c00;font-family:sans-serif;">' +
                '<h2>UI5 betöltési hiba</h2>' +
                '<p>Nem sikerült betölteni: <code>' + config.url + '</code></p>' +
                '<p>Környezet: <strong>' + config.name + '</strong></p>' +
                '<p>Próbáld: <a href="?env=cdn">CDN mód</a></p>' +
                '</div>';
        };

        document.head.appendChild(script);
    }

    // Export
    window.UI5_CONFIGS = UI5_CONFIGS;
    window.UI5Bootstrap = {
        getEnvironment: getEnvironment,
        getConfig: function () { return UI5_CONFIGS[getEnvironment()]; },
        load: loadUI5
    };
})();
