declare global {
    interface Window {
      gtag?: (...args: any[]) => void
    }
  }
  
  export const GA_MEASUREMENT_ID = "G-E3CTSPCFSE"
  
  export const pageview = (url: string) => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  }
  