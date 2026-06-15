import './globals.css';

export const metadata = {
  title: 'نظام إدارة أوامر الإنتاج | Fathy Tin Can',
  description: 'نظام متكامل لإدارة ومتابعة أوامر الإنتاج في مصنع العبوات المعدنية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body> 
    </html>
  );
}
