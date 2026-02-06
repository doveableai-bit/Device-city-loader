import React, { useState, useEffect } from "react";
import { setRegionEnvironment, getCurrentRegion, type Region } from "@/lib/region-environment";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGIONS: { value: Region; label: string; flag: string }[] = [
  { value: "US", label: "United States 🇺🇸", flag: "🇺🇸" },
  { value: "FR", label: "France 🇫🇷", flag: "🇫🇷" },
  { value: "DE", label: "Germany 🇩🇪", flag: "🇩🇪" },
  { value: "UK", label: "United Kingdom 🇬🇧", flag: "🇬🇧" },
  { value: "CA", label: "Canada 🇨🇦", flag: "🇨🇦" },
  { value: "AU", label: "Australia 🇦🇺", flag: "🇦🇺" },
  { value: "IN", label: "India 🇮🇳", flag: "🇮🇳" },
  { value: "JP", label: "Japan 🇯🇵", flag: "🇯🇵" },
  { value: "BR", label: "Brazil 🇧🇷", flag: "🇧🇷" },
];

export function RegionSelector() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(getCurrentRegion());

  useEffect(() => {
    // Set initial region environment
    setRegionEnvironment(selectedRegion);
  }, []);

  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region);
    setRegionEnvironment(region);

    // Show confirmation
    const regionLabel = REGIONS.find((r) => r.value === region)?.label;
    console.log(`Region changed to: ${regionLabel}`);
    console.log(`Browser environment updated for ${region} region`);
    console.log(`Ads will now display in ${region} environment`);
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🌍 Select Region for Browser Environment
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Change the browser environment, geolocation, and ad preferences
        </p>
        <Select value={selectedRegion} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select region..." />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-center">
          <p className="text-2xl">{REGIONS.find((r) => r.value === selectedRegion)?.flag}</p>
          <p className="text-xs font-bold text-gray-700">{selectedRegion}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            console.log(`Current Region: ${selectedRegion}`);
            const env = (window as any).__REGION_ENV__;
            console.log("Region Environment:", env);
          }}
        >
          Show Details
        </Button>
      </div>
    </div>
  );
}
