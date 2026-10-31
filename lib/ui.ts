import type { LangCode } from "./langs";

type Strings = {
  appName: string;
  tagline: string;
  sub: string;
  newCall: string;
  haveCode: string;
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
  reviewTitle: string;
  reviewHint: string;
  tapReveal: string;
  knew: string;
  notYet: string;
  reviewScore: string;
  reviewAgain: string;
  backToCall: string;
};

export const UI: Record<LangCode, Strings> = {
  en: {
    appName: "Call Bridge",
    tagline: "Everyone speaks their own language. Everyone understands.",
    sub: "No app. No account. Just share the code.",
    newCall: "Start a new call",
    haveCode: "Or join with a code",
    yourName: "Your name",
    yourLanguage: "Your language",
    start: "Start a call",
    join: "Join",
    codeLabel: "Call code",
    codePlaceholder: "K4M2",
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
    reviewTitle: "Words from this call",
    reviewHint: "Tap a card to see what it means.",
    tapReveal: "Tap to see the meaning",
    knew: "I knew this",
    notYet: "Not yet",
    reviewScore: "You knew {n} of {total}",
    reviewAgain: "Review again",
    backToCall: "Back to the call",
  },
  ru: {
    appName: "Call Bridge",
    tagline: "Каждый говорит на своём языке. Все понимают друг друга.",
    sub: "Без приложений и регистрации. Просто отправьте код.",
    newCall: "Новый разговор",
    haveCode: "Или войдите по коду",
    yourName: "Ваше имя",
    yourLanguage: "Ваш язык",
    start: "Начать разговор",
    join: "Войти",
    codeLabel: "Код разговора",
    codePlaceholder: "K4M2",
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
    reviewTitle: "Слова из этого разговора",
    reviewHint: "Нажмите на карточку, чтобы увидеть значение.",
    tapReveal: "Нажмите, чтобы увидеть значение",
    knew: "Знаю",
    notYet: "Ещё нет",
    reviewScore: "Вы знали {n} из {total}",
    reviewAgain: "Повторить",
    backToCall: "Вернуться к разговору",
  },
  uz: {
    appName: "Call Bridge",
    tagline: "Har kim o\u02bbz tilida gapiradi. Hamma bir-birini tushunadi.",
    sub: "Ilova ham, ro\u02bbyxatdan o\u02bbtish ham shart emas. Shunchaki kodni yuboring.",
    newCall: "Yangi suhbat",
    haveCode: "Yoki kod bilan qo\u02bbshiling",
    yourName: "Ismingiz",
    yourLanguage: "Tilingiz",
    start: "Suhbatni boshlash",
    join: "Qo\u02bbshilish",
    codeLabel: "Suhbat kodi",
    codePlaceholder: "K4M2",
    copy: "Havolani nusxalash",
    copied: "Nusxalandi",
    hold: "Bosib turing va gapiring",
    speaking: "Gapiring — tugatgach qo\u02bbyib yuboring",
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
    reviewTitle: "Suhbatdagi so\u02bblar",
    reviewHint: "Ma\u02bcnosini ko\u02bbrish uchun kartani bosing.",
    tapReveal: "Ma\u02bcnosini ko\u02bbrish uchun bosing",
    knew: "Bilaman",
    notYet: "Hali yo\u02bbq",
    reviewScore: "Siz {total} tadan {n} tasini bildingiz",
    reviewAgain: "Qayta ko\u02bbrib chiqish",
    backToCall: "Suhbatga qaytish",
  },
};
