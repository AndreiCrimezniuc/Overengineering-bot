import TgBot from "../telegram";

export async function runOnTuesdayAndSaturday(NotifyNow: () => void) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();

        // Check if it's Tuesday and the time is 8:00
        if (currentDay === 2 && currentHour === 8 && currentMinute === 0) {
            NotifyNow()
        }

        // Check if it's Saturday and the time is 8:00
        if (currentDay === 6 && currentHour === 8 && currentMinute === 0) {
            NotifyNow();
        }
    }, 60000); // Check every minute

}

export function handleRowsFromExcel(names: string[][], bot: TgBot) {
    for (let i = 1; i < names.length; i++) {
        handleRow(names[i], bot)
        console.log(`Handlind ${names[i]}`)
    }
}

function handleRow(row: string[], bot: TgBot) {
    if (!isNaN(Date.parse(row[1]))) {
        if (row[2] === undefined || row[3] === undefined || row[4] === undefined) {
            bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${row[2]}. \n На первом микрофоне: ${row[3]}. \nНа втором микрофоне: ${row[4]}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`).then((r) =>
                console.log(r)
            )
        } else {
            bot.SendMsg(`Привет. Я бот на стажировке. Пока я еще не уверен в себе, но уже могу предупредить,что \n На аппаратуре послужит ${row[2]}. \n На первом микрофоне: ${row[3]}. \nНа втором микрофоне: ${row[4]}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`).then((r) =>
                console.log(r)
            )
        }
    }
}