import type { Metadata } from "next";
import { getVenues } from "@/data/worldcup-2026";
import { MapPin, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Venues — WorldCup 2026",
  description: "All 16 host venues across USA, Canada, and Mexico for the FIFA World Cup 2026.",
};

export default function VenuesPage() {
  const venues = getVenues();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Host Venues</h1>
        <p className="text-muted-foreground">16 stadiums across USA, Canada, and Mexico</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-card rounded-xl border border-border p-5 hover:ring-2 hover:ring-primary transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{venue.flag}</span>
              <div>
                <h3 className="font-bold text-lg">{venue.city}</h3>
                <p className="text-sm text-muted-foreground">{venue.country}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{venue.stadium}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {venue.capacity.toLocaleString()} seats
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {venue.matches} matches
                </span>
              </div>
            </div>

            <div className="mt-3 w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${(venue.capacity / 90000) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {Math.round((venue.capacity / 90000) * 100)}% of largest venue capacity
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
