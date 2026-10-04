import "./admin.css";

export const metadata = {
  title: "Rocket Stake Admin",
  description: "Staking admin",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
