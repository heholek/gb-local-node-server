"use strict";
exports.__esModule = true;
var ActionHandler = /** @class */ (function () {
    function ActionHandler(gbService) {
        this.gbService = gbService;
    }
    ActionHandler.prototype.handleActions = function (actionType, data) {
        var _a, _b;
        switch (actionType) {
            case "move":
                (_a = this.gbService.topicMap.get("move")) === null || _a === void 0 ? void 0 : _a.publish(data);
                break;
            case "dataCollectionMode":
                (_b = this.gbService.topicMap.get("dataCollection")) === null || _b === void 0 ? void 0 : _b.publish(data);
                break;
        }
    };
    ActionHandler.prototype.publish = function (topicKey, data) {
        var _a;
        (_a = this.gbService.topicMap.get(topicKey)) === null || _a === void 0 ? void 0 : _a.publish(data);
    };
    return ActionHandler;
}());
exports.ActionHandler = ActionHandler;
