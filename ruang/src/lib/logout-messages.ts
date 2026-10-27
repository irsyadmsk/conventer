// Generated from irsyads/packages/design-tokens/src/logout-messages.ts.
type InterfaceMessages = Record<string, { en?: string; ar?: string; zh?: string }>;
export const logoutMessages: InterfaceMessages = {
  'Logout belum terkonfirmasi. Periksa koneksi dan sesi Anda sebelum mencoba lagi.': {
    en: 'Sign out could not be confirmed. Check your connection and session before trying again.',
    ar: 'لم يتم تأكيد تسجيل الخروج. تحقق من اتصالك وجلستك قبل المحاولة مجددًا.',
    zh: '尚无法确认是否已退出登录。请先检查网络连接和当前会话，再尝试操作。',
  },
  'Sesi Anda berubah. Sesi yang lebih baru tetap masuk; periksa akun aktif sebelum melanjutkan.': {
    en: 'Your session changed. The newer session remains signed in; check the active account before continuing.',
    ar: 'تغيّرت جلستك. ما زالت الجلسة الأحدث مسجّلة الدخول؛ تحقق من الحساب النشط قبل المتابعة.',
    zh: '会话已更改。较新的会话仍保持登录；请先检查当前账户，再继续操作。',
  },
  'Logout server selesai, tetapi pembersihan sesi lokal belum terkonfirmasi. Minta bantuan sebelum melanjutkan.': {
    en: 'Server sign out completed, but local session cleanup could not be confirmed. Ask for help before continuing.',
    ar: 'اكتمل تسجيل الخروج من الخادم، لكن لم يتم تأكيد مسح الجلسة المحلية. اطلب المساعدة قبل المتابعة.',
    zh: '服务器已完成退出登录，但尚无法确认本地会话是否已清理。请先寻求帮助，再继续操作。',
  },
};
