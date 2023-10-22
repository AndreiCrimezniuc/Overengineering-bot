"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const notifer_1 = require("../../../src/services/notifier/notifer");
const moment_1 = tslib_1.__importDefault(require("moment"));
test("FilterMinisterRowsByCriteria should return at cases", () => {
    let minister = {
        date: (0, moment_1.default)("12-25-1995", "MM-DD-YYYY"),
        Sound: "whatever",
        FirstMicrophone: "whatever",
        SoundLearner: "whatever",
        SecondMicrophone: "whatever"
    };
    let ministers = [];
    ministers.push(minister);
    expect((0, notifer_1.FilterMinisterRowsByCriteria)(ministers, false)).toBe(ministers);
});
//# sourceMappingURL=notifier.js.map