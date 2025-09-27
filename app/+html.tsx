import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* Google Fonts for Material Icons */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Noted" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Theme Color */}
        <meta name="theme-color" content="#000000" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS App Icons */}
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/assets/images/icon.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/assets/images/icon.png" />

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

            /* Body styling for PWA */
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              min-height: 100vh;
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
            }

            #root {
              min-height: 100vh;
              width: 100%;
              position: relative;
            }

            /* iOS PWA specific fixes */
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

            /* iOS standalone mode specific */
            @media (display-mode: fullscreen), (display-mode: standalone) {
              html {
                height: 100vh;
                height: -webkit-fill-available;
              }

              body {
                min-height: 100vh;
                min-height: -webkit-fill-available;
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