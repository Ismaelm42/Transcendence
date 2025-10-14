var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from '../spa/stepRender.js';
import { StatsUI } from './StatsUI.js';
const DEFAULT_CONTAINER_ID = "stats-container";
export default class Stats extends Step {
    constructor(containerId = DEFAULT_CONTAINER_ID, id) {
        super(containerId);
        this.ui = new StatsUI(this);
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ui.initializeUI(appElement);
        });
    }
}
