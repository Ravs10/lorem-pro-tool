export const metadata = {
  title: "Fake Data Generator - Free Dummy Data in Hindi & English | Lorem Pro Tool",
  description: "Generate advanced fake dummy data in multiple languages - Hindi, English, Spanish. Get names, emails, phones, address for testing. Export JSON, CSV, SQL.",
  keywords: "fake data generator, dummy data generator, hindi fake data, fake name generator india, test data generator, json dummy data",
  openGraph: {
    title: "Fake Data Generator - Advanced Multi Language Tool",
    description: "Free tool to generate fake data in Hindi & English for developers",
  }
};

import FakeClient from "./client";
export default function Page(){
  return <FakeClient />;
}
