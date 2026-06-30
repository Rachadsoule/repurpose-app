import "./globals.css";

export const metadata = {
  title: "Repurpose — Un signal, toutes les fréquences",
  description:
    "Transforme un contenu long en thread, post LinkedIn, légende Instagram, script court et newsletter, en un clic.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
    }
