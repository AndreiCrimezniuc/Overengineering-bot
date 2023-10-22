import {isTuesdayOrSaturday} from "../../../src/services/notifier/notifer";
import  {expect, test } from 'vitest'
import moment from "moment";

test("isTuesdayOrSaturday should works", () => {
    let sunday = moment("22.10.2023","DD.MM.YYYY")
    let saturday = moment("21.10.2023","DD.MM.YYYY")
    let tuesday = moment("17.10.2023","DD.MM.YYYY")


    expect(isTuesdayOrSaturday(sunday)).toBe(false)
    expect(isTuesdayOrSaturday(saturday)).toBe(true)
    expect(isTuesdayOrSaturday(tuesday)).toBe(true)
})