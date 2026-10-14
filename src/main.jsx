import React, { lazy, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import pageLoaders from "./pages/index.js";
import { pageMetadata } from "./pageMetadata.js";

const pages = Object.fromEntries(
  Object.entries(pageLoaders).map(([pageName, loader]) => [
    pageName,
    lazy(loader),
  ]),
);

function PageResources({ pageName }) {
  useEffect(() => {
    const metadata = pageMetadata[pageName] || pageMetadata.index;
    document.title = metadata.title;

    const links = metadata.styles.map((style) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = /^https?:\/\//i.test(style)
        ? style
        : `${import.meta.env.BASE_URL}${style}`;
      link.dataset.routeStyle = pageName;
      link.onerror = () => {
        console.error(`No se pudo cargar la hoja de estilos: ${style}`);
      };
      document.head.appendChild(link);
      return link;
    });

    return () => links.forEach((link) => link.remove());
  }, [pageName]);

  return null;
}

function RoutedPage({ pageName }) {
  const Page = pages[pageName];
  return (
    <>
      <PageResources pageName={pageName} />
      <Suspense fallback={<main aria-live="polite">Cargando...</main>}>
        <Page />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoutedPage pageName="index" />} />
        <Route path="/index.html" element={<RoutedPage pageName="index" />} />
        {Object.keys(pages)
          .filter((pageName) => pageName !== "index")
          .map((pageName) => (
            <Route
              key={pageName}
              path={`/${pageName}.html`}
              element={<RoutedPage pageName={pageName} />}
            />
          ))}
        <Route path="*" element={<RoutedPage pageName="index" />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
