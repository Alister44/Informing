
var requestURL_ua = 'https://alister44.github.io/Informing/airports_ua.json';
var requestURL_en = 'https://alister44.github.io/Informing/airports_en.json';
const map_en = new Map(Object.entries(getAP(requestURL_en)));
const map_ua = new Map(Object.entries(getAP(requestURL_ua)));

document.querySelector('button').addEventListener("click", myClick);


function myClick2()
{
    let info="Колеги, пасажири проінформовані про затримку рейсу шляхом SMS та email повідомлень.<br>"+
    "З повагою,<br><br>"+   
    
    "Пишемо звіт на<br>"+
    "agent <agent@skyup.aero><br>"+
    "+ у копію<br>"
    "Marina Taldykova <m.taldykova@skyup.aero>; Nataliia Durdas <n.durdas@skyup.aero>; Andrii Fadieiev <a.fadieiev@skyup.aero>;"+
    "pr <pr@skyup.aero>; Duty Operations Officer <doo@skyup.aero>; ops <ops@skyup.aero>; KBP <KBP@skyup.aero>;"+
    "Nataliya Tyran <n.tyran@skyup.aero>; Group SkyUp <group@skyup.aero>; Charter Operations <Charter@skyup.aero> ";


}


function myClick() {



    var PDCinfo;

    PDCinfo = document.querySelector('.pdc').value;

    var LT_STD = WrapDate(fndDate(PDCinfo, "STD"), Get_LT_STD(PDCinfo), "STD", Get_UTC(PDCinfo, "STD"));
    var LT_ETD = WrapDate(fndDate(PDCinfo, "ETD"), Get_LT_ETD(PDCinfo), "ETD", Get_UTC(PDCinfo, "ETD"));




    document.querySelector('.out_sms').innerHTML = Show_SMS(PDCinfo, LT_ETD);
    document.querySelector('.out_email').innerHTML = Show_email(PDCinfo);


    document.querySelector('.delay').innerHTML = "Затримка складає: " + Time_delay(LT_ETD, LT_STD).hour + " годин, "
        + Time_delay(LT_ETD, LT_STD).minute + " хвилин.";



}


//задача: преобразование объекта даты lt_ETD (дату отправления)
// в string, дату отправления в корректном формате "02.03.2023"

function Get_Str_ETD(lt_ETD) {

    let date = lt_ETD.getDate();
    let month = lt_ETD.getMonth() + 1;

    let strD;
    let strM;

    if (date < 10) {
        strD = "0" + date.toString();
    }
    else {
        strD = date.toString();
    }

    if (month < 10) {
        strM = "0" + month.toString();
    }
    else {
        strM = month.toString();
    }

    let res = strD + "." + strM + "." + lt_ETD.getFullYear();
    return res;

}

//возвращает JSON string, принимает URL
function getAP(fileName) {
    let request = new XMLHttpRequest();
    request.open('GET', fileName, false);
    request.send(null);
    return JSON.parse(request.responseText);
}

//приниает текст пдс и возвращает string, причину задержки
function reason_Of_Dalay_SMS(textPDC) {

    let str_Late_arr = "piznye prybuttya litaka z poperednoho reysu/late arrival of the plane from the previous flight";
    let tech_res = "vyrobnycha/is production";
    let oper_res = "operatsiyna/operational";
    let meteo_cond = "meteorolohichni umovy/meteorological conditions";

    if (textPDC.indexOf("late arrival") !== -1) {
        return str_Late_arr;
    }

    if (textPDC.indexOf("technical reason") !== -1) {
        return tech_res;
    }

    if (textPDC.indexOf("operation") !== -1 || textPDC.indexOf("inad pax") !== -1) {
        return oper_res;
    }

    if (textPDC.indexOf("meteorological conditions") !== -1) {
        return meteo_cond;
    }


}

//возвращает string местное время изначального времени вылета
function Get_LT_STD(textPDC) {
    let i = textPDC.indexOf("STD");
    return textPDC.slice(i + 21, i + 25);
}

//возвращает string местное время нового времени вылета
function Get_LT_ETD(textPDC) {

    let i = textPDC.indexOf("ETD");
    if (textPDC.indexOf("New ETD") !== -1) {
        return textPDC.slice(i + 22, i + 26);
    }

    else
        return textPDC.slice(i + 21, i + 25);
}

//возвращает string местное время нового времени прибытия
function Get_LT_ETA(textPDC) {
    let i = textPDC.indexOf("ETA");
    return textPDC.slice(i + 21, i + 25);
}

// принимает string - textPDC, string - timecode("ETD", "STD" ... )
//возвращает string - UTC: "1205"
function Get_UTC(textPDC, timecode) {
    let i = textPDC.indexOf(timecode);
    return textPDC.slice(i + 12, i + 17);
}

//функция принимающая дату в формате string '18FEB22', time в формате "0235" string, (часы, минуты)
//parDate (string "STD" || "ETD")
//UTC в формате "0235" string, (часы, минуты)
//возвращает объект Date()
function WrapDate(date_p, time, parDate, UTC) {

    date = new Date(date_p);
    hours = Number(time.slice(0, 2));
    mins = Number(time.slice(2, 4));
    utc_h = Number(UTC.slice(0, 2));
    //если функция обертывает время вылета(изначальное или новое) то нужно проверить был ли переход на новые сутки
    if (parDate === "STD" || parDate === "ETD") {
        if (Is_new_date(utc_h, hours) === true) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, hours, mins);
        }
        else

            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, mins);

    }

    else

        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, mins);


}

//возвращает строку (номер рейса)
function findPQ(textPDC) {

    let i = textPDC.indexOf('PQ'); //индекс вхождения PQ

    if (i === -1) {
        return "Undefined PQ";
    }

    while (textPDC[i] !== " ") {
        i++;
    }

    return textPDC.slice(textPDC.indexOf('PQ'), i + 1);
}

// данные функции fndDep и fndDest будут работать только если формат PDC: "PQ831 KBP-NCE" 
// если после рейса через 1 пробел не указаны Dep and Dest данные функции работать не будут

// на буд: сделать функцию возвращающую i чтобы не писать циклы во всех функциях

//возвращает строку (3-х значный код ап вылета по IATA) 
function fndDep(textPDC) {

    let i = textPDC.indexOf('PQ'); //индекс вхождения PQ

    if (i === -1) {
        return "Undefined Departure";
    }

    while (textPDC[i] !== " ") {
        i++;
    }
    return textPDC.slice(i + 1, i + 4);
}

//возвращает строку (3-х значный код ап прибытия по IATA) 
function fndDest(textPDC) {
    let i = textPDC.indexOf('PQ'); //индекс вхождения PQ

    if (i === -1) {
        return "Undefined Destination";
    }


    while (textPDC[i] !== " ") {
        i++;
    }

    return textPDC.slice(i + 5, i + 8);
}

//проверка перехода на новые сутки
//принимает числовые параметры, возвращает булевый результат
function Is_new_date(UTC_h, LT_h) {

    if (UTC_h > LT_h) {
        return true;
    }
    else return false;
}

// fndDate can find and return date of STD STA ETD ETA (indicate it in param strTime)
function fndDate(textPDC, strTime) {
    let i = textPDC.indexOf(strTime);//индекс первого

    return textPDC.slice(i + 4, i + 11);
}

// проверка, Украина ли страна отправления
function IsDepUkraine(ap_Dep) {

    let AP_UCR = ['HRK', 'IEV', 'KBP', 'ODS', 'OZH', 'LWO'];
    let marcker = false;
    let i = 0;
    while (i !== AP_UCR.length) {
        if (ap_Dep === AP_UCR[i]) {
            marcker = true;
            i = AP_UCR.length;
        }
        else
            i++;
    }
    return marcker;
}

//принимает текст PDC, возвращает строку с номером телефона, в зависимости от страны отправления
function GetInfo_tel(textPDC) {
    var info_tel;

    if (IsDepUkraine(fndDep(textPDC)) === true) {
        //не запрашиваем чекин
        info_tel = "0800303113";
    }
    else {
        //запрашиваем чекин
        info_tel = "+380443300013";
    }
    return info_tel;
}


//функция принимает 2 объекта даты:
//LT_STD - изначальное местное время вылета
//LT_ETD - новое местное время вылета
//возвращает часы и минуты int
function Time_delay(LT_ETD, LT_STD) {

    let hour, minute;
    let interval = LT_ETD - LT_STD;

    let hours = interval / 3600000;

    if (hours < 1) {
        hour = 0;
        minute = interval / 60000;

    }
    else if (hours >= 1) {
        hour = Math.trunc(hours);
        minute = (interval - (hour * 3600000)) / 60000;
    };

    return {
        hour: hour,
        minute: minute
    }

}

function reason_Of_Dalay_email(textPDC) {

    if (textPDC.indexOf("late arrival") !== -1) {
        return {
            ua: " пізнім прибуттям літака з попереднього рейсу ",
            en: " the late arrival of the aircraft from the previous flight"
        }
    }

    if (textPDC.indexOf("technical reason") !== -1) {
        return {
            ua: " виробничими причинами ",
            en: " production reasons"
        }
    }

    if (textPDC.indexOf("operation") !== -1 || textPDC.indexOf("inad pax") !== -1) {
        return {
            ua: " операційними причинами ",
            en: " operational reasons"
        }
    }

    if (textPDC.indexOf("meteorological conditions") !== -1) {
        return {
            ua: " метеорологійчними умовами ",
            en: " meteorological conditions"
        }
    }

    else
        return {
            ua: " undefined reasons ",
            en: " undefined reasons"
        }

}



function Show_SMS(textPDC, ltetd) {

    let fullDep;
    let fullDest;
    let regist_time;
    if (IsDepUkraine(fndDep(textPDC)) === false) {
        regist_time = "Chas reyestratsiyi o/registration time at <b>00:00</b>. "
    }
    else {
        regist_time = "";
    }


    if (typeof map_en.get(fndDep(textPDC)) === "undefined") {
        fullDep = "Undefined departure";

    }
    else {
        fullDep = map_en.get(fndDep(textPDC));
    }


    if (typeof map_en.get(fndDest(textPDC)) === "undefined") {
        fullDest = "Undefined destination";

    }
    else {
        fullDest = map_en.get(fndDest(textPDC));
    }


    return "Uvaga!Reys, <b>" + findPQ(textPDC) + "</b> <b>" + fullDep + "</b>-<b>" + fullDest + "</b> za bronyuvannyam/" +
        "booking {pnr_code} vidbudetsya iz zatrymkou/the flight will be delayed." +
        "Prychyna/Reason - <b>" + reason_Of_Dalay_SMS(textPDC) + "</b>.Chas vyliotu o/departure time at <b>" + Get_LT_ETD(textPDC).slice(0, 2) + ":" +
        Get_LT_ETD(textPDC).slice(2, 4) + " " + Get_Str_ETD(ltetd) +
        "</b>, chas prybuttya o/arrival time at <b>" + Get_LT_ETA(textPDC).slice(0, 2) + ":" + Get_LT_ETA(textPDC).slice(2, 4) + "</b>." +
        regist_time + "Info " + GetInfo_tel(textPDC) + ".Prosymo vybachennya za nezruchnosti/sorry for the inconvenience.";

}

function Show_email(textPDC) {


    let reg_time_ua, reg_time_en;
    if (IsDepUkraine(fndDep(textPDC)) === false) {
        reg_time_ua = " Початок реєстрації о <b>00:00</b>."
        reg_time_en = " Registration starts at <b>00:00</b>."
    }
    else {
        reg_time_ua = "";
        reg_time_en = "";
    }

    return "Шановний пасажире,<br>" +
        "У зв’язку із<b>" + reason_Of_Dalay_email(textPDC).ua +
        "</b>ваш рейс <b>" + findPQ(textPDC) + " " + map_ua.get(fndDep(textPDC)) + " – " + map_ua.get(fndDest(textPDC)) +
        "</b> відбудеться із затримкою.<br>" +
        "Новий час вильоту – <b>" + Get_LT_ETD(textPDC).slice(0, 2) + ":" + Get_LT_ETD(textPDC).slice(2, 4) +
        "</b>, час прибуття – <b>" + Get_LT_ETA(textPDC).slice(0, 2) + ":" + Get_LT_ETA(textPDC).slice(2, 4) + "</b>." + reg_time_ua + "<br>" +
        "Якщо вам потрібна додаткова інформація, будь ласка, телефонуйте за номером " + GetInfo_tel(textPDC) +
        ".<br>Просимо вибачення за незручності,<br>" +
        "Команда SkyUp<br><br>"
        +
        "Dear passenger,<br>" +
        "Your flight <b>" + findPQ(textPDC) + " " + map_en.get(fndDep(textPDC)) + " – " + map_en.get(fndDest(textPDC)) +
        "</b> will be delayed because of <b>" + reason_Of_Dalay_email(textPDC).en +
        "</b>. New departure time is <b>" + Get_LT_ETD(textPDC).slice(0, 2) + ":" + Get_LT_ETD(textPDC).slice(2, 4) +
        "</b>, arrival time is <b>" + Get_LT_ETA(textPDC).slice(0, 2) + ":" + Get_LT_ETA(textPDC).slice(2, 4) +
        "</b>." + reg_time_en + "<br>Should you need any additional information, please call " + GetInfo_tel(textPDC) +
        ".<br>We apologize for the inconvenience,<br>" +
        "SkyUp Team"

}
