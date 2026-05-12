import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { BusReport, Route } from '../types';
import { Bus, MapPin, Navigation, Info } from 'lucide-react';
import { format } from 'date-fns';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const BusMarker: React.FC<{ report: BusReport, route?: Route }> = ({ report, route }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={report.location}
        onClick={() => setInfoOpen(true)}
      >
        <div className="relative group">
          <div className="bg-slate-900 text-white p-2 border border-slate-700 shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform rounded-lg">
            <Bus size={18} className="text-blue-400" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
        </div>
      </AdvancedMarker>

      {infoOpen && (
        <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)}>
          <div className="p-3 font-sans text-slate-900 min-w-[240px]">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-sm uppercase tracking-tight text-slate-800">Telemetry Unit Data</h4>
              <div className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 font-mono font-bold rounded uppercase tracking-wider">LIVE_FEED</div>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-bold uppercase tracking-tighter">Route Node:</span>
                <span className="font-bold text-slate-800">{route?.name || report.routeId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-bold uppercase tracking-tighter">Current Stop:</span>
                <span className="font-bold text-blue-600 uppercase">{report.stopId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-bold uppercase tracking-tighter">Contributor:</span>
                <span className="font-medium">{report.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-tighter">Sync Time:</span>
                <span className="font-mono font-bold">
                  {report.timestamp?.seconds 
                    ? format(new Date(report.timestamp.seconds * 1000), 'HH:mm:ss') 
                    : 'Real-time'}
                </span>
              </div>
            </div>
            
            <button className="w-full mt-5 bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20">
              Initialize Tracking
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapPage: React.FC = () => {
  const [latestReports, setLatestReports] = useState<BusReport[]>([]);
  const [routes, setRoutes] = useState<Record<string, Route>>({});

  useEffect(() => {
    // Listen to latest verified reports
    const unsubReports = onSnapshot(
      collection(db, 'latest_reports'), 
      (snap) => {
        const reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusReport));
        setLatestReports(reports);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'latest_reports')
    );

    const unsubRoutes = onSnapshot(
      collection(db, 'routes'), 
      (snap) => {
        const routesMap: Record<string, Route> = {};
        snap.docs.forEach(doc => {
          const data = doc.data() as Route;
          routesMap[doc.id] = data;
        });
        setRoutes(routesMap);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'routes')
    );

    return () => {
      unsubReports();
      unsubRoutes();
    };
  }, []);

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] border border-slate-200 border-dashed bg-white rounded-3xl">
        <div className="text-center max-w-md p-10">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-3xl w-fit mx-auto mb-6 border border-slate-100">
            <Info size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">Map Protocol Offline</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
            The geospatial visualization engine requires a valid verification key. 
            Assign <code>GOOGLE_MAPS_PLATFORM_KEY</code> to the system secrets.
          </p>
          <div className="bg-slate-900 text-white p-4 rounded-2xl text-[10px] uppercase font-mono tracking-widest shadow-lg shadow-slate-900/10">
            Auth Token Required
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Geospatial Awareness</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Active telemetry monitoring across the Hassan transit nodes</p>
        </div>
        <div className="flex gap-6 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">LIVE_UNIT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">STATIC_NODE</span>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] border border-slate-200 bg-slate-200 rounded-3xl relative overflow-hidden shadow-inner group">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={{ lat: 12.9716, lng: 77.5946 }} // Bangalore default
            defaultZoom={11}
            mapId="GRAMA_YATRI_ADMIN_MAP"
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {latestReports.map(report => (
              <BusMarker 
                key={report.id || report.routeId} 
                report={report} 
                route={routes[report.routeId]} 
              />
            ))}

            {/* Render all stops for all routes (simplified for now) */}
            {(Object.values(routes) as Route[]).map(route => 
              route.stops?.map(stop => (
                <AdvancedMarker key={`${route.id}-${stop.id}`} position={stop.location}>
                  <div className="w-2 h-2 bg-slate-400 rounded-full border border-white opacity-40 hover:opacity-100 transition-all hover:scale-150" />
                </AdvancedMarker>
              ))
            )}
          </Map>
        </APIProvider>

        {/* Map Overlay Controls - Technical Dashboard styled */}
        <div className="absolute top-6 left-6 p-5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl max-w-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
             <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Network Intel</h4>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400 font-bold uppercase">Active Units:</span>
              <span className="text-slate-900 font-bold">{latestReports.length}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400 font-bold uppercase">Coverage:</span>
              <span className="text-green-600 font-bold">OPTIMAL</span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
              Geospatial data is synthesized from verified user reports and moderated in real-time.
            </p>
          </div>
          
          <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
            Initialize Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
