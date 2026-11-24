
"use client";

import { useEffect } from "react";
import "swagger-ui-dist/swagger-ui.css";

export default function ApiDocsPage() {
  useEffect(() => {
    let cancelled = false;
    let swaggerInstance: any;

    async function initializeSwagger() {
      const module = await import(
        "swagger-ui-dist/swagger-ui-bundle.js"
      );

      if (cancelled) return;

      const SwaggerUIBundle = module.default ?? module;

      swaggerInstance = SwaggerUIBundle({
        url: "/api/docs",
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true,
      });
    }

    initializeSwagger();

    return () => {
      cancelled = true;
      swaggerInstance?.destroy?.();
    };
  }, []);

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div id="swagger-ui" />
      </div>
    </main>
  );
}
