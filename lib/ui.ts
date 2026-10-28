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
  inviteTitle: string;
  inviteBody: string;
  copy: string;
  copied: string;
  listening: string;
  speaking: string;
  sending: string;
  waiting: string;
  nobodyYet: string;
  endCall: string;
  recapTitle: string;
  recapWorking: string;
  micDenied: string;
  people: string;
  hideVideo: string;
  showVideo: string;
  copyRecap: string;
  recapCopied: string;
  recapFor: string;
  mute: string;
  unmute: string;
  autoListening: string;
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
    inviteTitle: "Send this to the others",
    inviteBody: "They open the link, pick their language, and join. No account needed.",
    copy: "Copy link",
    copied: "Copied",
    listening: "Listening…",
    speaking: "Speaking — pause when done",
    sending: "Translating",
    waiting: "Waiting for the others to join",
    nobodyYet: "Nothing said yet. Just start speaking.",
    endCall: "End call and get the recap",
    recapTitle: "Recap of the call",
    recapWorking: "Writing the recap",
    micDenied: "The microphone is blocked. Allow it in your browser settings, then reload.",
    people: "In this call",
    hideVideo: "Hide video",
    showVideo: "Show video",
    copyRecap: "Copy",
    recapCopied: "Copied",
    recapFor: "Written for you to keep or send on",
    mute: "Mute",
    unmute: "Unmute",
    autoListening: "Auto — speaks when it hears you",
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
    inviteTitle: "Отправьте это остальным",
    inviteBody: "Они откроют ссылку, выберут язык и присоединятся. Регистрация не нужна.",
    copy: "Скопировать ссылку",
    copied: "Скопировано",
    listening: "Слушаю…",
    speaking: "Говорите — сделайте паузу, когда закончите",
    sending: "Перевожу",
    waiting: "Ждём остальных участников",
    nobodyYet: "Пока ничего не сказано. Просто начните говорить.",
    endCall: "Завершить и получить итог",
    recapTitle: "Итог разговора",
    recapWorking: "Готовлю итог",
    micDenied: "Микрофон заблокирован. Разрешите доступ в настройках браузера и обновите страницу.",
    people: "Участники",
    hideVideo: "Скрыть видео",
    showVideo: "Показать видео",
    copyRecap: "Скопировать",
    recapCopied: "Скопировано",
    recapFor: "Можно сохранить или переслать",
    mute: "Выключить микрофон",
    unmute: "Включить микрофон",
    autoListening: "Авто — переводит, когда вас слышит",
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
    inviteTitle: "Buni boshqalarga yuboring",
    inviteBody: "Ular havolani ochadi, tilini tanlaydi va qo\u02bbshiladi. Ro\u02bbyx atdan o\u02bbtish shart emas.",
    copy: "Havolani nusxalash",
    copied: "Nusxalandi",
    listening: "Eshitayapman…",
    speaking: "Gapiring — tugatgach to\u02bbxtang",
    sending: "Tarjima qilinmoqda",
    waiting: "Boshqalar qo\u02bbshilishini kutyapmiz",
    nobodyYet: "Hali hech narsa aytilmadi. Gapira boshlang.",
    endCall: "Yakunlash va xulosani olish",
    recapTitle: "Suhbat xulosasi",
    recapWorking: "Xulosa tayyorlanmoqda",
    micDenied: "Mikrofon bloklangan. Brauzer sozlamalarida ruxsat bering va sahifani yangilang.",
    people: "Ishtirokchilar",
    hideVideo: "Videoni yashirish",
    showVideo: "Videoni ko\u02bbrsatish",
    copyRecap: "Nusxalash",
    recapCopied: "Nusxalandi",
    recapFor: "Saqlab qo\u02bbyish yoki yuborish uchun",
    mute: "Mikrofonni o\u02bbchirish",
    unmute: "Mikrofonni yoqish",
    autoListening: "Avto — sizni eshitganda tarjima qiladi",
  },
};
