import { TypedEventEmitter } from "./events.js";
import type { Runtime, DialogResult, DialogResultType, AlertDialogOptions, InputDialogOptions, CustomDialogOptions } from "./types.js";

export class MockRuntime extends TypedEventEmitter<any> implements Runtime {
    public __calls: Record<string, any[]> = {
        dialogs_showModalDialog: []
    };

    private _nextDialogResult: DialogResult | null = null;
    
    public dialogs = {
        showModalDialog: async (options: AlertDialogOptions | InputDialogOptions | CustomDialogOptions): Promise<DialogResult> => {
            this.__calls.dialogs_showModalDialog.push({ options });
            
            if (this._nextDialogResult) {
                const res = this._nextDialogResult;
                this._nextDialogResult = null;
                return res;
            }

            return {
                type: 'button' as DialogResultType,
                buttonType: 'cancel'
            };
        }
    };

    __setNextDialogResult(result: DialogResult): void {
        this._nextDialogResult = result;
    }
}
