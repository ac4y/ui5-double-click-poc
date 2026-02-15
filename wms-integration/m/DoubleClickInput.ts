import Input from "./Input";
import { $NTTInputSettings } from "./Input";
import MessageToast from "sap/m/MessageToast";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import Log from "sap/base/Log";

const LOG_TAG = "DoubleClickInput";

export interface $DoubleClickInputSettings extends $NTTInputSettings {
    clickTimeout?: number | PropertyBindingInfo;
    firstClickMessage?: string | PropertyBindingInfo;
    secondClickMessage?: string | PropertyBindingInfo;
    lockedMessage?: string | PropertyBindingInfo;
    doubleClick?: (event: Event) => void;
    firstClick?: (event: Event) => void;
}

/**
 * Custom Input control - dupla kattintással szerkeszthető mező.
 *
 * Alapállapotban read-only. Első kattintásra vizuális visszajelzés,
 * második kattintásra (timeout-on belül) szerkeszthetővé válik.
 * Fókuszvesztéskor visszaáll read-only módba.
 *
 * Az ntt.wms.m.Input-ból származik, így az inputmode property
 * és a mobil billentyűzet kezelés is öröklődik.
 *
 * @namespace ntt.wms.m
 */
export default class DoubleClickInput extends Input {

    private _clickCount: number = 0;
    private _lastClickTime: number = 0;
    private _clickDelegate: object | null = null;

    metadata = {
        properties: {
            /**
             * Inputmode öröklés az ntt.wms.m.Input-ból
             */
            'inputmode': { type: 'string', defaultValue: (window as any)["ntt_disableKeyboardOnMobile"] == true ? 'none' : 'text' },

            /**
             * Időkorlát ms-ban két kattintás között
             */
            'clickTimeout': { type: 'int', defaultValue: 500 },

            /**
             * Első kattintáskor megjelenő üzenet
             */
            'firstClickMessage': { type: 'string', defaultValue: 'Első kattintás – kattints még egyszer a szerkesztéshez' },

            /**
             * Második kattintáskor megjelenő üzenet
             */
            'secondClickMessage': { type: 'string', defaultValue: 'Szerkeszthető mód aktiválva' },

            /**
             * Visszazárásnál megjelenő üzenet
             */
            'lockedMessage': { type: 'string', defaultValue: 'Mező védve' }
        },
        events: {
            /**
             * Dupla kattintás esemény – a mező szerkeszthetővé vált
             */
            'doubleClick': {},

            /**
             * Első kattintás esemény – vizuális feedback
             */
            'firstClick': {}
        }
    };

    constructor(idOrSettings?: string | $DoubleClickInputSettings, mSettings?: $DoubleClickInputSettings) {
        super(idOrSettings as any, mSettings as any);
    }

    public init(): void {
        (Input.prototype as any).init.apply(this, arguments);

        this.setEditable(false);
        this._clickCount = 0;
        this._lastClickTime = 0;

        this.addStyleClass("doubleClickInput");

        this._setupEventDelegate();
    }

    // ─── Event delegate ──────────────────────────────────────

    private _setupEventDelegate(): void {
        this._clickDelegate = {
            onclick: (oEvent: any) => { this._handleClickEvent(oEvent); },
            onfocusout: (oEvent: any) => { this._handleBlurEvent(oEvent); }
        };
        this.addEventDelegate(this._clickDelegate, this);
    }

    // ─── Kattintás kezelés ───────────────────────────────────

    private _handleClickEvent(_oEvent: any): void {
        if (this.getEditable()) {
            return;
        }

        const now = Date.now();
        const diff = now - this._lastClickTime;

        if (diff > (this as any).getClickTimeout()) {
            this._clickCount = 0;
        }

        this._clickCount++;
        this._lastClickTime = now;

        if (this._clickCount === 1) {
            this._handleFirstClick();
        } else if (this._clickCount >= 2) {
            this._handleSecondClick();
        }
    }

    private _handleFirstClick(): void {
        this.addStyleClass("doubleClickInputHighlight");
        MessageToast.show((this as any).getFirstClickMessage());
        (this as any).fireFirstClick();

        Log.debug("First click registered", undefined, LOG_TAG);

        const timeout = (this as any).getClickTimeout() as number;
        setTimeout(() => { this._resetClickState(); }, timeout);
    }

    private _handleSecondClick(): void {
        this.removeStyleClass("doubleClickInputHighlight");
        this.addStyleClass("doubleClickInputEdit");

        this.setEditable(true);
        MessageToast.show((this as any).getSecondClickMessage());

        setTimeout(() => {
            this.focus();
            this.selectText(0, this.getValue().length);
        }, 50);

        this._clickCount = 0;
        (this as any).fireDoubleClick();

        Log.debug("Double click – editable mode", undefined, LOG_TAG);
    }

    // ─── Blur → read-only ────────────────────────────────────

    private _handleBlurEvent(_oEvent: any): void {
        if (this.getEditable()) {
            this.setEditable(false);
            this.removeStyleClass("doubleClickInputEdit");
            MessageToast.show((this as any).getLockedMessage());

            Log.debug("Blur – locked", undefined, LOG_TAG);
        }
    }

    // ─── Reset ───────────────────────────────────────────────

    private _resetClickState(): void {
        this._clickCount = 0;
        this.removeStyleClass("doubleClickInputHighlight");
    }

    // ─── Cleanup ─────────────────────────────────────────────

    public exit(): void {
        if (this._clickDelegate) {
            this.removeEventDelegate(this._clickDelegate);
            this._clickDelegate = null;
        }
        (Input.prototype as any).exit?.apply(this, arguments);
    }

    // ─── Renderer ────────────────────────────────────────────

    renderer = {
        writeInnerAttributes(oRm: any, oInput: any) {
            (sap.m as any).InputRenderer.writeInnerAttributes.apply(this, arguments);
            oRm.attr('inputmode', oInput.getInputmode());
        }
    };
}
