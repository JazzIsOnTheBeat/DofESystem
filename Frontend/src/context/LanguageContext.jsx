import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Translations
const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No data found',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    
    // Roles
    chairman: 'Chairman',
    viceChairman: 'Vice Chairman',
    secretary: 'Secretary',
    treasurer: 'Treasurer',
    member: 'Member',
    
    // Sidebar
    dashboard: 'Dashboard',
    cash: 'Cash',
    members: 'Members',
    summary: 'Summary',
    auditLogs: 'Audit Logs',
    settings: 'Settings',
    
    // Header
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    clearAll: 'Clear all',
    logout: 'Log out',
    logoutSuccess: 'Logout successful',
    
    // Login
    signIn: 'Sign In',
    processing: 'Processing...',
    loginFailed: 'Login failed',
    loginSuccess: 'Login successful',
    networkError: 'A network error occurred',
    
    // Settings
    settingsTitle: 'Settings',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    on: 'On',
    off: 'Off',
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    indonesian: 'Indonesian',
    
    // Home
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    goodNight: 'Good Night',
    totalMembers: 'Total Members',
    activeMembers: 'active members',
    cashBalance: 'Cash Balance',
    availableCash: 'available cash',
    myPayments: 'My Payments',
    notYet: 'not yet',
    pendingVerification: 'Pending Verification',
    pendingPayments: 'pending payments',
    thisYearTarget: "This Year's Target",
    perMember: 'per member',
    quickActions: 'Quick Actions',
    payCash: 'Pay Cash',
    payMonthlyCash: 'Pay monthly cash via QRIS',
    viewMembers: 'View Members',
    listAllMembers: 'List of all DofE members',
    manageCash: 'Manage Cash',
    verifyManagePayments: 'Verify & manage payments',
    recentActivity: 'Recent Activity',
    noActivitiesYet: 'No activities yet',
    viewAllLogs: 'View all logs',
    cashStatus: 'Cash Status',
    paid: 'Paid',
    thankYouPayment: 'Thank you! Your cash payment has been received.',
    notYetPaid: 'Not Yet Paid',
    paymentNotReceived: 'Your cash payment has not been received. Pay via QRIS now!',
    payNow: 'Pay Now',
    financialSummary: 'Financial Summary',
    income: 'Income',
    expenses: 'Expenses',
    balance: 'Balance',
    activitySchedule: 'Activity Schedule',
    friday: 'Friday',
    saturday: 'Saturday',
    weeklyRoutine: 'Weekly routine activities',
    outdoorTraining: 'Outdoor training (conditional)',
    unableToLoadActivities: 'Unable to load activities',
    now: 'Now',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    loadingDashboard: 'Loading dashboard...',
    
    // Cash
    cashFund: 'Cash Fund',
    managePaymentsExpenses: 'Manage member cash payments and expenses',
    addExpense: 'Add Expense',
    verification: 'Verification',
    totalCashIn: 'Total Cash In',
    totalExpenses: 'Total Expenses',
    currentBalance: 'Current Balance',
    cashPaymentTable: 'Cash Payment Table',
    expenseList: 'Expense List',
    topMembersPayments: 'Top 5 members with most payments',
    months: 'months',
    cashPayment: 'Cash Payment',
    scanQRIS: 'Scan QRIS to pay',
    selectMonth: 'Select Month:',
    uploadPaymentProof: 'Upload Payment Proof:',
    submitProof: 'Submit Proof',
    description: 'Description:',
    amount: 'Amount (Rp):',
    paymentVerification: 'Payment Verification',
    viewProof: 'View Proof',
    accept: 'Accept',
    reject: 'Reject',
    waitingVerification: 'Waiting Verification',
    selectPaymentProof: 'Please select payment proof!',
    paymentProofSubmitted: 'Payment proof submitted successfully! Waiting for Treasurer confirmation.',
    failedSubmitProof: 'Failed to submit payment proof.',
    failedProcessVerification: 'Failed to process verification.',
    amountDescRequired: 'Amount and description are required',
    failedAddExpense: 'Failed to add expense',
    deleteExpense: 'Delete this expense?',
    failedDeleteExpense: 'Failed to delete expense',
    deletePaymentStatus: 'Delete payment status for',
    failedChangePaymentStatus: 'Failed to change payment status',
    loadingData: 'Loading data...',
    
    // Members
    memberList: 'Member List',
    manageViewMembers: 'Manage and view all DofE ST Bhinneka members',
    addMember: 'Add Member',
    leadership: 'Leadership',
    regularMembers: 'Regular Members',
    searchNameNIM: 'Search name or NIM...',
    allRoles: 'All Roles',
    noMembersFound: 'No members found',
    addNewMember: 'Add New Member',
    fullName: 'Full Name',
    enterFullName: 'Enter full name',
    enterNIM: 'Enter NIM',
    role: 'Role',
    password: 'Password',
    enterPassword: 'Enter password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm password',
    saving: 'Saving...',
    editMember: 'Edit Member',
    newPassword: 'New Password (leave empty if not changing)',
    enterNewPassword: 'Enter new password',
    confirmNewPassword: 'Confirm New Password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    saveChanges: 'Save Changes',
    deleteMember: 'Delete Member',
    confirmDeleteMember: 'Are you sure you want to delete member:',
    actionCannotBeUndone: 'This action cannot be undone!',
    deleting: 'Deleting...',
    you: 'You',
    nameNIMPasswordRequired: 'Name, NIM, and Password are required',
    passwordMismatch: 'Password and Confirm Password do not match',
    failedAddMember: 'Failed to add member',
    nameNIMRequired: 'Name and NIM are required',
    failedUpdateMember: 'Failed to update member',
    loadingMemberData: 'Loading member data...',
    
    // Audit Logs
    auditLogsTitle: 'Audit Logs',
    monitorActivities: 'Monitor all activities in the system',
    pengurusOnly: 'Leadership Only',
    totalLogs: 'Total Logs',
    today: 'Today',
    payments: 'Payments',
    verifications: 'Verifications',
    searchActivities: 'Search activities...',
    allActivities: 'All Activities',
    paymentCreated: 'Payment Created',
    paymentVerified: 'Payment Verified',
    paymentRejected: 'Payment Rejected',
    paymentDeleted: 'Payment Deleted',
    userCreated: 'User Created',
    userUpdated: 'User Updated',
    expenseCreated: 'Expense Created',
    expenseDeleted: 'Expense Deleted',
    activity: 'Activity',
    noLogsFound: 'No logs found',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    accessDenied: 'Access Denied',
    accessDeniedMessage: 'This page can only be accessed by leadership (Chairman, Vice Chairman, Secretary, Treasurer).',
    loadingAuditLogs: 'Loading audit logs...',
    
    // Not Found
    pageNotFound: 'Page Not Found',
    pageNotFoundMessage: 'Sorry, the page you are looking for is not available or has been moved.',
    backToHome: 'Back to Home',
    previousPage: 'Previous Page',
    
    // Work In Progress
    underDevelopment: 'Under Development',
    underDevelopmentMessage: 'This feature is currently under development and will be available soon. Thank you for your patience!',
    estimated: 'Estimated: Coming Soon',

    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },
  id: {
    // Common
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    add: 'Tambah',
    search: 'Cari',
    loading: 'Memuat...',
    noData: 'Data tidak ditemukan',
    confirm: 'Konfirmasi',
    yes: 'Ya',
    no: 'Tidak',
    
    // Roles
    chairman: 'Ketua',
    viceChairman: 'Wakil Ketua',
    secretary: 'Sekretaris',
    treasurer: 'Bendahara',
    member: 'Anggota',
    
    // Sidebar
    dashboard: 'Dashboard',
    cash: 'Kas',
    members: 'Anggota',
    summary: 'Ringkasan',
    auditLogs: 'Log Audit',
    settings: 'Pengaturan',
    
    // Header
    notifications: 'Notifikasi',
    noNotifications: 'Tidak ada notifikasi',
    clearAll: 'Hapus semua',
    logout: 'Keluar',
    logoutSuccess: 'Logout berhasil',
    
    // Login
    signIn: 'Masuk',
    processing: 'Memproses...',
    loginFailed: 'Login gagal',
    loginSuccess: 'Login berhasil',
    networkError: 'Terjadi kesalahan jaringan',
    
    // Settings
    settingsTitle: 'Pengaturan',
    appearance: 'Tampilan',
    darkMode: 'Mode Gelap',
    on: 'Aktif',
    off: 'Nonaktif',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
    english: 'Inggris',
    indonesian: 'Indonesia',
    
    // Home
    goodMorning: 'Selamat Pagi',
    goodAfternoon: 'Selamat Siang',
    goodEvening: 'Selamat Sore',
    goodNight: 'Selamat Malam',
    totalMembers: 'Total Anggota',
    activeMembers: 'anggota aktif',
    cashBalance: 'Saldo Kas',
    availableCash: 'kas tersedia',
    myPayments: 'Pembayaran Saya',
    notYet: 'belum',
    pendingVerification: 'Menunggu Verifikasi',
    pendingPayments: 'pembayaran pending',
    thisYearTarget: 'Target Tahun Ini',
    perMember: 'per anggota',
    quickActions: 'Aksi Cepat',
    payCash: 'Bayar Kas',
    payMonthlyCash: 'Bayar kas bulanan via QRIS',
    viewMembers: 'Lihat Anggota',
    listAllMembers: 'Daftar semua anggota DofE',
    manageCash: 'Kelola Kas',
    verifyManagePayments: 'Verifikasi & kelola pembayaran',
    recentActivity: 'Aktivitas Terbaru',
    noActivitiesYet: 'Belum ada aktivitas',
    viewAllLogs: 'Lihat semua log',
    cashStatus: 'Status Kas',
    paid: 'Lunas',
    thankYouPayment: 'Terima kasih! Pembayaran kas sudah diterima.',
    notYetPaid: 'Belum Bayar',
    paymentNotReceived: 'Pembayaran kas belum diterima. Segera bayar via QRIS!',
    payNow: 'Bayar Sekarang',
    financialSummary: 'Ringkasan Keuangan',
    income: 'Pemasukan',
    expenses: 'Pengeluaran',
    balance: 'Saldo',
    activitySchedule: 'Jadwal Kegiatan',
    friday: 'Jumat',
    saturday: 'Sabtu',
    weeklyRoutine: 'Kegiatan rutin mingguan',
    outdoorTraining: 'Latihan outdoor (kondisional)',
    unableToLoadActivities: 'Tidak dapat memuat aktivitas',
    now: 'Sekarang',
    justNow: 'Baru saja',
    minutesAgo: 'menit lalu',
    hoursAgo: 'jam lalu',
    daysAgo: 'hari lalu',
    loadingDashboard: 'Memuat dashboard...',
    
    // Cash
    cashFund: 'Uang Kas',
    managePaymentsExpenses: 'Kelola pembayaran kas anggota dan pengeluaran',
    addExpense: 'Tambah Pengeluaran',
    verification: 'Verifikasi',
    totalCashIn: 'Total Kas Masuk',
    totalExpenses: 'Total Pengeluaran',
    currentBalance: 'Saldo Saat Ini',
    cashPaymentTable: 'Tabel Pembayaran Kas',
    expenseList: 'Daftar Pengeluaran',
    topMembersPayments: 'Top 5 anggota pembayaran terbanyak',
    months: 'bulan',
    cashPayment: 'Pembayaran Kas',
    scanQRIS: 'Scan QRIS untuk membayar',
    selectMonth: 'Pilih Bulan:',
    uploadPaymentProof: 'Upload Bukti Pembayaran:',
    submitProof: 'Kirim Bukti',
    description: 'Deskripsi:',
    amount: 'Jumlah (Rp):',
    paymentVerification: 'Verifikasi Pembayaran',
    viewProof: 'Lihat Bukti',
    accept: 'Terima',
    reject: 'Tolak',
    waitingVerification: 'Menunggu Verifikasi',
    selectPaymentProof: 'Pilih bukti pembayaran!',
    paymentProofSubmitted: 'Bukti pembayaran berhasil dikirim! Menunggu konfirmasi Bendahara.',
    failedSubmitProof: 'Gagal mengirim bukti pembayaran.',
    failedProcessVerification: 'Gagal memproses verifikasi.',
    amountDescRequired: 'Jumlah dan deskripsi harus diisi',
    failedAddExpense: 'Gagal menambahkan pengeluaran',
    deleteExpense: 'Hapus pengeluaran ini?',
    failedDeleteExpense: 'Gagal menghapus pengeluaran',
    deletePaymentStatus: 'Hapus status pembayaran untuk',
    failedChangePaymentStatus: 'Gagal mengubah status pembayaran',
    loadingData: 'Memuat data...',
    
    // Members
    memberList: 'Daftar Anggota',
    manageViewMembers: 'Kelola dan lihat semua anggota DofE ST Bhinneka',
    addMember: 'Tambah Anggota',
    leadership: 'Pengurus',
    regularMembers: 'Anggota Biasa',
    searchNameNIM: 'Cari nama atau NIM...',
    allRoles: 'Semua Role',
    noMembersFound: 'Tidak ada anggota ditemukan',
    addNewMember: 'Tambah Anggota Baru',
    fullName: 'Nama Lengkap',
    enterFullName: 'Masukkan nama lengkap',
    enterNIM: 'Masukkan NIM',
    role: 'Role',
    password: 'Password',
    enterPassword: 'Masukkan password',
    confirmPassword: 'Konfirmasi Password',
    confirmPasswordPlaceholder: 'Konfirmasi password',
    saving: 'Menyimpan...',
    editMember: 'Edit Anggota',
    newPassword: 'Password Baru (kosongkan jika tidak ingin mengubah)',
    enterNewPassword: 'Masukkan password baru',
    confirmNewPassword: 'Konfirmasi Password Baru',
    confirmNewPasswordPlaceholder: 'Konfirmasi password baru',
    saveChanges: 'Simpan Perubahan',
    deleteMember: 'Hapus Anggota',
    confirmDeleteMember: 'Apakah Anda yakin ingin menghapus anggota:',
    actionCannotBeUndone: 'Tindakan ini tidak dapat dibatalkan!',
    deleting: 'Menghapus...',
    you: 'Anda',
    nameNIMPasswordRequired: 'Nama, NIM, dan Password wajib diisi',
    passwordMismatch: 'Password dan Konfirmasi Password tidak cocok',
    failedAddMember: 'Gagal menambahkan anggota',
    nameNIMRequired: 'Nama dan NIM wajib diisi',
    failedUpdateMember: 'Gagal mengupdate anggota',
    loadingMemberData: 'Memuat data anggota...',
    
    // Audit Logs
    auditLogsTitle: 'Log Audit',
    monitorActivities: 'Pantau semua aktivitas dalam sistem',
    pengurusOnly: 'Khusus Pengurus',
    totalLogs: 'Total Log',
    today: 'Hari Ini',
    payments: 'Pembayaran',
    verifications: 'Verifikasi',
    searchActivities: 'Cari aktivitas...',
    allActivities: 'Semua Aktivitas',
    paymentCreated: 'Pembayaran Dibuat',
    paymentVerified: 'Pembayaran Diverifikasi',
    paymentRejected: 'Pembayaran Ditolak',
    paymentDeleted: 'Pembayaran Dihapus',
    userCreated: 'User Dibuat',
    userUpdated: 'User Diupdate',
    expenseCreated: 'Pengeluaran Dibuat',
    expenseDeleted: 'Pengeluaran Dihapus',
    activity: 'Aktivitas',
    noLogsFound: 'Tidak ada log ditemukan',
    previous: 'Sebelumnya',
    next: 'Selanjutnya',
    page: 'Halaman',
    of: 'dari',
    accessDenied: 'Akses Ditolak',
    accessDeniedMessage: 'Halaman ini hanya dapat diakses oleh pengurus (Ketua, Wakil Ketua, Sekretaris, Bendahara).',
    loadingAuditLogs: 'Memuat audit logs...',
    
    // Not Found
    pageNotFound: 'Halaman Tidak Ditemukan',
    pageNotFoundMessage: 'Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.',
    backToHome: 'Kembali ke Beranda',
    previousPage: 'Halaman Sebelumnya',
    
    // Work In Progress
    underDevelopment: 'Sedang Dalam Pengembangan',
    underDevelopmentMessage: 'Fitur ini sedang dalam proses pengembangan dan akan segera tersedia. Terima kasih atas kesabaran Anda!',
    estimated: 'Perkiraan: Segera Hadir',

    // Months
    january: 'Januari',
    february: 'Februari',
    march: 'Maret',
    april: 'April',
    may: 'Mei',
    june: 'Juni',
    july: 'Juli',
    august: 'Agustus',
    september: 'September',
    october: 'Oktober',
    november: 'November',
    december: 'Desember',
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = useCallback((key) => {
    return translations[language][key] || key;
  }, [language]);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
  }, []);

  const getMonthName = useCallback((monthIndex) => {
    const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    return t(monthKeys[monthIndex]);
  }, [t]);

  const getMonthsArray = useCallback(() => {
    return ['january', 'february', 'march', 'april', 'may', 'june', 
            'july', 'august', 'september', 'october', 'november', 'december'].map(key => t(key));
  }, [t]);

  const formatRole = useCallback((role) => {
    const roleMap = {
      'ketua': t('chairman'),
      'wakilKetua': t('viceChairman'),
      'sekretaris': t('secretary'),
      'bendahara': t('treasurer'),
      'anggota': t('member')
    };
    return roleMap[role] || role;
  }, [t]);

  const formatRelativeTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });
  }, [language, t]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 15) return t('goodAfternoon');
    if (hour < 18) return t('goodEvening');
    return t('goodNight');
  }, [t]);

  const value = {
    language,
    changeLanguage,
    t,
    getMonthName,
    getMonthsArray,
    formatRole,
    formatRelativeTime,
    getGreeting
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
