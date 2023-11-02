"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const notifer_1 = require("../../../src/services/notifier/notifer");
const vitest_1 = require("vitest");
const moment_1 = tslib_1.__importDefault(require("moment"));
(0, vitest_1.test)("isTuesdayOrSaturday should works", () => {
    let sunday = (0, moment_1.default)("22.10.2023", "DD.MM.YYYY");
    let saturday = (0, moment_1.default)("21.10.2023", "DD.MM.YYYY");
    let tuesday = (0, moment_1.default)("17.10.2023", "DD.MM.YYYY");
    (0, vitest_1.expect)((0, notifer_1.isTuesdayOrSaturday)(sunday)).toBe(false);
    (0, vitest_1.expect)((0, notifer_1.isTuesdayOrSaturday)(saturday)).toBe(true);
    (0, vitest_1.expect)((0, notifer_1.isTuesdayOrSaturday)(tuesday)).toBe(true);
});
//# sourceMappingURL=notifier.test.js.map