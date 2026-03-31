import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=390, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
              background-color: #1a0a2e;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            #root {
              width: 390px;
              max-width: 390px;
              min-height: 100vh;
              overflow-x: hidden;
              position: relative;
              background-color: #1a0a2e;
            }
            video {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
            }
            img {
              max-width: 100% !important;
            }
          `
        }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
