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
              overscroll-behavior: none;
              -webkit-overflow-scrolling: touch;
            }

            /* Remove body padding - let app handle safe areas */
            body {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
            }

            #root {
              height: 100%;
              position: relative;
              overflow: hidden;
            }

            /* PWA-specific safe area handling */
            @supports (padding: env(safe-area-inset-top)) {
              .pwa-safe-top {
                padding-top: env(safe-area-inset-top);
              }

              .pwa-safe-bottom {
                padding-bottom: env(safe-area-inset-bottom);
              }

              .pwa-safe-horizontal {
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
              }
            }

            /* Prevent elastic scrolling on iOS */
            .no-bounce {
              position: fixed;
              overflow: hidden;
              width: 100%;
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