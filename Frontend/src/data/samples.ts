import { SatelliteSample, AnalysisRecord } from '../types';
import opticalImg from '../assets/images/multimodal_satellite_optical_1790235611853.jpg';
import sarImg from '../assets/images/sar_radar_coastal_1790235625239.jpg';
import changeImg from '../assets/images/satellite_change_detection_1790235637290.jpg';

export const SATELLITE_SAMPLES: SatelliteSample[] = [
  {
    id: 'opt-agri-01',
    title: 'Agricultural Basin & River Delta',
    sensor: 'RGB Image Sample',
    modality: 'Optical',
    resolution: 'Image resolution not provided',
    acquisitionDate: '2026-08-14 10:42 UTC',
    coordinates: '43°34\'12"N, 4°42\'29"E',
    crs: 'Not provided',
    imageUrl: opticalImg,
    description: 'Sample image for demonstrating image analysis.',
    recommendedQueries: [
      'Segment all irrigated agricultural parcels and evaluate crop moisture status',
      'Detect center-pivot irrigation circles and measure radius distribution',
      'Identify sediment plumes discharging along the river delta boundary',
      'Locate solar photovoltaic farm installations adjacent to the canal'
    ]
  },
  {
    id: 'sar-harbor-02',
    title: 'Commercial Harbor & Anchorage',
    sensor: 'Radar Image Sample',
    modality: 'SAR',
    resolution: 'Image resolution not provided',
    acquisitionDate: '2026-09-02 05:18 UTC',
    coordinates: '51°55\'18"N, 4°17\'52"E',
    crs: 'Not provided',
    imageUrl: sarImg,
    description: 'Sample radar image for demonstrating the interface.',
    recommendedQueries: [
      'Detect all moored container vessels and extract hull bounding coordinates',
      'Identify oil slick surface damping signatures in the outer fairway channel',
      'Analyze visible harbor structures in the sample image',
      'Count anchored cargo tankers in the offshore waiting zone'
    ]
  },
  {
    id: 'chg-reservoir-03',
    title: 'Reservoir Waterline & Forest Margin',
    sensor: 'Satellite Image Sample',
    modality: 'Change Detection',
    resolution: '15m Panchromatic / 30m RGB',
    acquisitionDate: '2026-07-29 18:05 UTC',
    coordinates: '36°01\'04"N, 114°44\'17"W',
    crs: 'Not provided',
    imageUrl: changeImg,
    description: 'Sample image for demonstrating change-detection workflow.',
    recommendedQueries: [
      'Quantify waterline boundary recession compared to baseline summer 2024',
      'Map post-wildfire burn scar perimeter and vegetative recovery rate',
      'Identify exposed reservoir sediment islands above the current bathymetric pool',
      'Detect road network expansion into forested watershed boundaries'
    ]
  }
];

export const RECENT_MISSION_HISTORY: AnalysisRecord[] = [
  {
    id: 'SAT-9042',
    timestamp: '2026-09-23 16:20:14 UTC',
    satellite: 'RGB Image Sample',
    modality: 'Optical',
    query: 'Identify center-pivot irrigation circles and measure parcel density across quadrant B-4',
    coordinates: '38°12\'N, 102°45\'W',
    status: 'Completed',
    detectionsCount: 42
  },
  {
    id: 'SAT-9041',
    timestamp: '2026-09-22 08:14:02 UTC',
    satellite: 'Radar Image Sample',
    modality: 'Radar',
    query: 'Detect cargo vessels exceeding 150m LOA in the Malacca Strait traffic separation zone',
    coordinates: '02°44\'N, 101°29\'E',
    status: 'Completed',
    detectionsCount: 19
  },
  {
    id: 'SAT-9040',
    timestamp: '2026-09-20 22:50:33 UTC',
    satellite: 'Satellite Image Sample',
    modality: 'Change Detection',
    query: 'Calculate surface water area shrinkage of Lake Urmia relative to 2025 epoch',
    coordinates: '37°42\'N, 45°19\'E',
    status: 'Completed',
    detectionsCount: 7
  },
  {
    id: 'SAT-9039',
    timestamp: '2026-09-18 11:32:10 UTC',
    satellite: 'Satellite Image Sample',
    modality: 'Optical',
    query: 'Locate illegal mining dredge pits along the Madre de Dios river corridor',
    coordinates: '12°35\'S, 69°11\'W',
    status: 'Completed',
    detectionsCount: 31
  },
  {
    id: 'SAT-9038',
    timestamp: '2026-09-16 03:08:44 UTC',
    satellite: 'Radar Image Sample',
    modality: 'Radar',
    query: 'Identify structural displacement along the fault line escarpment post-seismic event',
    coordinates: '37°21\'N, 15°04\'E',
    status: 'Completed',
    detectionsCount: 12
  }
];
