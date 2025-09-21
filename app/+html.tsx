import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        {/* Google Fonts for Material Icons */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Noted" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Theme Color */}
        <meta name="theme-color" content="#000000" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <ScrollViewStyleReset />

        {/* Safe Area CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --safe-area-inset-top: env(safe-area-inset-top);
              --safe-area-inset-bottom: env(safe-area-inset-bottom);
              --safe-area-inset-left: env(safe-area-inset-left);
              --safe-area-inset-right: env(safe-area-inset-right);
            }

            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow-x: hidden;
            }

            body {
              padding-top: var(--safe-area-inset-top);
              padding-bottom: var(--safe-area-inset-bottom);
              padding-left: var(--safe-area-inset-left);
              padding-right: var(--safe-area-inset-right);
            }

            #root {
              height: 100%;
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}