import { jsx as _jsx } from "react/jsx-runtime";
import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
    title: 'Rotten - Educational Content Brainrot Converter',
    description: 'Convert your educational content into engaging brainrot language',
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { className: inter.className, children: _jsx("main", { className: "min-h-screen bg-gray-50", children: children }) }) }));
}
