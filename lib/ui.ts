import type { LangCode } from "./langs";

type Strings = {
  appName: string;
  tagline: string;
  yourName: string;
  yourLanguage: string;
  start: string;
  join: string;
  codeLabel: string;
  codePlaceholder: string;
  copy: string;
  copied: string;
  hold: string;
  speaking: string;
  sending: string;
  waiting: string;
  nobodyYet: string;
  endCall: string;
  recapTitle: string;
  recapWorking: string;
  micDenied: string;
  people: string;
  copyRecap: string;
  recapCopied: string;
  recapFor: string;
  speakingSuffix: string;
};

export const UI: Record<LangCode, Strings> = {
  en: {
    appName: "Call Bridge",
    tagline: "Everyone speaks their own language. Everyone understands.",
    yourName: "Your name",
    yourLanguage: "Your language",
    start: "Start a call",
    join: "Join",
    codeLabel: "Call code",
    codePlaceholder: "e.g. K4M2",
    copy: "Copy link",
    copied: "Copied",
    hold: "Hold to speak",
    speaking: "Speaking — release when done",
    sending: "Translating…",
    waiting: "Waiting for others to join",
    nobodyYet: "Hold the button and speak.",
    endCall: "End call & get recap",
    recapTitle: "Recap of the call",
    recapWorking: "Writing the recap…",
    micDenied: "Microphone blocked. Allow it in browser settings and reload.",
    people: "In this call",
    copyRecap: "Copy",
    recapCopied: "Copied",
    recapFor: "Keep this or send it on",
    speakingSuffix: "is speaking",
  },
  ru: {
    appName: "Call Bridge",
    tagline: "Каждый говорит на своём языке. Все понимают друг друга.",
    yourName: "Ваше имя",
    yourLanguage: "Ваш язык",
    start: "Начать разговор",
    join: "Присоединиться",
    codeLabel: "Код разговора",
    codePlaceholder: "например K4M2",
    copy: "Скопировать ссылку",
    copied: "Скопировано",
    hold: "Нажмите и говорите",
    speaking: "Говорите — отпустите, когда закончите",
    sending: "Перевожу…",
    waiting: "Ждём остальных участников",
    nobodyYet: "Нажмите кнопку и говорите.",
    endCall: "Завершить и получить итог",
    recapTitle: "Итог разговора",
    recapWorking: "Готовлю итог…",
    micDenied: "Микрофон заблокирован. Разрешите доступ в настройках и обновите страницу.",
    people: "Участники",
    copyRecap: "Скопировать",
    recapCopied: "Скопировано",
    recapFor: "Сохраните или перешлите",
    speakingSuffix: "говорит",
  },
  uz: {
    appName: "Call Bridge",
    tagline: "Har kim o\u02bbz tilida gapiradi. Hamma bir-birini tushunadi.",
    yourName: "Ismingiz",
    yourLanguage: "Tilingiz",
    start: "Suhbatni boshlash",
    join: "Qo\u02bbshilish",
    codeLabel: "Suhbat kodi",
    codePlaceholder: "masalan K4M2",
    copy: "Havolani nusxalash",
    copied: "Nusxalandi",
    hold: "Bosib turing va gapiring",
    speaking: "Gapiring — tugatgach qo\u02bbying",
    sending: "Tarjima qilinmoqda…",
    waiting: "Boshqalar qo\u02bbshilishini kutyapmiz",
    nobodyYet: "Tugmani bosib turing va gapiring.",
    endCall: "Yakunlash va xulosa olish",
    recapTitle: "Suhbat xulosasi",
    recapWorking: "Xulosa tayyorlanmoqda…",
    micDenied: "Mikrofon bloklangan. Brauzer sozlamalarida ruxsat bering va sahifani yangilang.",
    people: "Ishtirokchilar",
    copyRecap: "Nusxalash",
    recapCopied: "Nusxalandi",
    recapFor: "Saqlab qo\u02bbyish yoki yuborish uchun",
    speakingSuffix: "gapirmoqda",
  },
};
