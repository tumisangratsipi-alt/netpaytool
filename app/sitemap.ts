import type { MetadataRoute } from "next";
import { STATE_NAMES } from "@/lib/tax-data";

const SALARY_TIERS = [
  30000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000,
  80000, 90000, 100000, 110000, 120000, 130000, 150000, 175000,
  200000, 250000, 300000,
];

export default function sitemap(): MetadataRoute.Sitemap {
  const salaryStatePages: MetadataRoute.Sitemap = [];
  for (const salary of SALARY_TIERS) {
    for (const code of Object.keys(STATE_NAMES)) {
      salaryStatePages.push({
        url: `https://netpaytool.com/${salary}/${code.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.8,
      });
    }
  }

  return [
    {
      url: "https://netpaytool.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://netpaytool.com/methodology",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...salaryStatePages,
  ];
}
