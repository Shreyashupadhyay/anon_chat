import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Removed Geist_Mono as it's not used
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster import

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AnonChat', // Updated title
  description: 'Chat anonymously with a random person.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}> {/* Removed Geist_Mono class */}
        {children}
        <Toaster /> {/* Added Toaster component */}
      </body>
    </html>
  );
}
