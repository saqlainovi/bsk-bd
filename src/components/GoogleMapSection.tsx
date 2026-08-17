import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react';

interface GoogleMapSectionProps {
  language: 'bn' | 'en';
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const GoogleMapSection: React.FC<GoogleMapSectionProps> = ({ language }) => {
  const center = { lat: 23.74831, lng: 90.39281 }; // Bishwo Shahitto Kendro, Banglamotor, Dhaka
  const MAP_URL = 'https://maps.app.goo.gl/nGZ4X7sXKzokaJdb8';

  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  return (
    <div className="w-full space-y-4 font-sans text-left pt-6 border-t border-[#B8862A]/20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#2E5942]/10 text-[#2E5942] rounded-lg">
              <MapPin className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-extrabold text-lg md:text-xl text-[#1A1207]">
              {language === 'bn' ? 'গুগল ম্যাপে আমাদের অবস্থান' : 'Our Location on Google Maps'}
            </h3>
          </div>
          <p className="text-xs text-stone-600 font-sans">
            {language === 'bn'
              ? 'বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০'
              : 'Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>{language === 'bn' ? 'ম্যাপে দিকনির্দেশনা দেখুন' : 'Get Directions'}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden shadow-md">
        {hasValidKey ? (
          <div className="w-full h-[420px] md:h-[480px] relative">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={center}
                defaultZoom={17}
                mapTypeId={mapType}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                gestureHandling="cooperative"
              >
                <AdvancedMarker
                  position={center}
                  onClick={() => setInfoOpen(!infoOpen)}
                  title="Bishwo Shahitto Kendro"
                >
                  <Pin background="#2E5942" glyphColor="#F0CC7A" borderColor="#1A1207" />
                </AdvancedMarker>

                {infoOpen && (
                  <InfoWindow
                    position={center}
                    onCloseClick={() => setInfoOpen(false)}
                  >
                    <div className="p-1 space-y-2 max-w-[260px] text-left font-sans text-stone-800">
                      <div className="border-b border-stone-200 pb-1.5">
                        <span className="text-[9px] bg-[#2E5942] text-white font-bold px-2 py-0.5 rounded-full">
                          {language === 'bn' ? 'প্রধান কার্যালয়' : 'Headquarters'}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#1A1207] mt-1">
                          {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র' : 'Bishwo Shahitto Kendro'}
                        </h4>
                      </div>

                      <div className="space-y-1 text-[11px] text-stone-600">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2E5942] shrink-0 mt-0.5" />
                          <span>১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#2E5942] shrink-0" />
                          <span>+৮৮০-২-৯৬৬১০৭৮</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#2E5942] shrink-0" />
                          <span>৯:০০ AM - ৫:০০ PM (শনি-বৃহ)</span>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-stone-100">
                        <a
                          href={MAP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 bg-[#B8862A] text-stone-950 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 hover:bg-[#A37422] transition"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>{language === 'bn' ? 'ম্যাপে রুট দেখুন' : 'View Route'}</span>
                        </a>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>

            {/* Map Type Toggle Floating Control */}
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-stone-200 rounded-xl p-1 shadow-md flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  mapType === 'roadmap' ? 'bg-[#2E5942] text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {language === 'bn' ? 'ম্যাপ' : 'Map'}
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  mapType === 'satellite' ? 'bg-[#2E5942] text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {language === 'bn' ? 'স্যাটেলাইট' : 'Satellite'}
              </button>
            </div>
          </div>
        ) : (
          /* Clean Interactive Map Embed without extra key badges */
          <div className="w-full h-[420px] md:h-[480px] relative bg-stone-100">
            <iframe
              title="Bishwo Shahitto Kendro Google Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.0238127391965!2d90.39055837602324!3d23.748310388915514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b89664cb90d9%3A0x6b772418e594d6e9!2sBishwo%20Shahitto%20Kendro!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};
