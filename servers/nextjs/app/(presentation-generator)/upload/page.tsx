import React from "react";

import UploadPage from "./components/UploadPage";
import Header from "@/app/(presentation-generator)/dashboard/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ahlan | AI Presentation Generator",
  description:
    "AI presentation generator with custom layouts, multi-model support, and PDF/PPTX export.",
  alternates: {
    canonical: "https://ahlan.ai/create",
  },
  keywords: [
    "presentation generator",
    "AI presentations",
    "data visualization",
    "automatic presentation maker",
    "professional slides",
    "data-driven presentations",
    "document to presentation",
    "presentation automation",
    "smart presentation tool",
    "business presentations",
  ],
  openGraph: {
    title: "Create Presentation | Ahlan",
    description:
      "AI presentation generator with custom layouts, multi-model support, and PDF/PPTX export.",
    type: "website",
    url: "https://ahlan.ai/create",
    siteName: "Ahlan",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Presentation | Ahlan",
    description:
      "AI presentation generator with custom layouts, multi-model support, and PDF/PPTX export.",
  },
};

const page = () => {
  return (
    <div className="relative">
      <Header />
      <div className="flex flex-col items-center justify-center  py-8">
        <h1 className="text-3xl font-semibold font-instrument_sans">
          Create Presentation{" "}
        </h1>
        {/* <p className='text-sm text-gray-500'>We will generate a presentation for you</p> */}
      </div>

      <UploadPage />
    </div>
  );
};

export default page;
