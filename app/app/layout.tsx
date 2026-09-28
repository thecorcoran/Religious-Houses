import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catholic Religious Houses Directory",
  description: "A directory of all Catholic religious houses (monasteries, abbeys, convents, oratories) in North America, searchable by Rite, Order, and location.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/SJPMe+HoISo5jT/W8="
          crossOrigin=""
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
