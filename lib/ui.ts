import type { LangCode } from "./langs";

/*
 * AZIZA: check the Uzbek and Russian here yourself. I wrote plausible
 * translations but you are the native speaker and this is the first thing your
 * mother will read. Getting these wrong undoes the whole point of the product.
 */

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
    hold: "Hold to speak",
    speaking: "Listening — let go when you finish",
    sending: "Translating",
    waiting: "Waiting for the others to join",
    nobodyYet: "Nothing said yet. Hold the button and speak.",
    endCall: "End call and get the recap",
    recapTitle: "Recap of the call",
    recapWorking: "Writing the recap",
    micDenied: "The microphone is blocked. Allow it in your browser settings, then reload.",
    people: "In this call",
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
    hold: "Нажмите и говорите",
    speaking: "Слушаю — отпустите, когда закончите",
    sending: "Перевожу",
    waiting: "Ждём остальных участников",
    nobodyYet: "Пока ничего не сказано. Нажмите кнопку и говорите.",
    endCall: "Завершить и получить итог",
    recapTitle: "Итог разговора",
    recapWorking: "Готовлю итог",
    micDenied: "Микрофон заблокирован. Разрешите доступ в настройках браузера и обновите страницу.",
    people: "Участники",
  },
  uz: {
    appName: "Call Bridge",
    tagline: "Har kim o'z tilida gapiradi. Hamma bir-birini tushunadi.",
    yourName: "Ismingiz",
    yourLanguage: "Tilingiz",
    start: "Suhbatni boshlash",
    join: "Qo'shilish",
    codeLabel: "Suhbat kodi",
    codePlaceholder: "masalan K4M2",
    inviteTitle: "Buni boshqalarga yuboring",
    inviteBody: "Ular havolani ochadi, tilini tanlaydi va qo'shiladi. Ro'yxatdan o'tish shart emas.",
    copy: "Havolani nusxalash",
    copied: "Nusxalandi",
    hold: "Gapirish uchun bosib turing",
    speaking: "Eshitayapman — tugatgach qo'yib yuboring",
    sending: "Tarjima qilinmoqda",
    waiting: "Boshqalar qo'shilishini kutyapmiz",
    nobodyYet: "Hali hech narsa aytilmadi. Tugmani bosib turing va gapiring.",
    endCall: "Yakunlash va xulosani olish",
    recapTitle: "Suhbat xulosasi",
    recapWorking: "Xulosa tayyorlanmoqda",
    micDenied: "Mikrofon bloklangan. Brauzer sozlamalarida ruxsat bering va sahifani yangilang.",
    people: "Ishtirokchilar",
  },
};
