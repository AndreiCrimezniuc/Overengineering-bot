import {
    AudioTeam, getLatestMinistersSchedule,
    isTuesdayOrSaturday,
    MinisterScheduleLatest,
    MinistersSchedule,
    Security
} from "../../../src/services/notifier/notifer";
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


test("is Latests cheudle is correct", () => {
    const audioTeam1: AudioTeam = {
        Date: moment(),
        FirstMicrophone: "f Microphone 1",
        SecondMicrophone: "s Microphone 1",
        Sound: "Sound 1",
        SoundLearner: "Sound Learner 1"
    };

    const audioTeam2: AudioTeam = {
        Date: moment().add(1, 'day'),
        FirstMicrophone: "f Microphone 2",
        SecondMicrophone: "s Microphone 2",
        Sound: "Sound 2",
        SoundLearner: "Sound Learner 2"
    };

    const security1: Security = {
        Date: moment(),
        Hall: "Hall 1",
        Entrance: "Entrance 1"
    };

    const security2: Security = {
        Date: moment().add(1, 'day'),
        Hall: "Hall 2",
        Entrance: "Entrance 2"
    };

    const schedule: MinistersSchedule = {
        AudioTeamSchedule: [audioTeam1, audioTeam2],
        SecuritySchedule: [security1, security2]
    }

    const latestSchedule: MinisterScheduleLatest = {
        AudioTeamSchedule: audioTeam2,
        SecuritySchedule: security2
    }

    expect(getLatestMinistersSchedule(schedule)).toEqual(latestSchedule)
})