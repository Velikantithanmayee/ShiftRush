import { Shift, WorkerDot } from './types';

export const API = 'http://localhost:5000';

export const MOCK_SHIFTS: Shift[] = [
  { id: 'mock-1', role: 'Espresso Barista', requiredSkills: ['barista', 'food_handler'], startTime: new Date(Date.now() + 7200000).toISOString(), endTime: new Date(Date.now() + 21600000).toISOString(), payRate: 22.50, urgencyLevel: 'high', status: 'open', businessName: 'Blue Bottle Coffee', distanceMeters: 850, matchScore: 98, fillProbability: 85 },
  { id: 'mock-2', role: 'Warehouse Handler', requiredSkills: ['warehouse', 'forklift'], startTime: new Date(Date.now() + 14400000).toISOString(), endTime: new Date(Date.now() + 36000000).toISOString(), payRate: 25.0, urgencyLevel: 'critical', status: 'open', businessName: 'Soma Logistics', distanceMeters: 3200, matchScore: 92, fillProbability: 95 },
];

export const MOCK_DOTS: WorkerDot[] = [
  { id: 'w-1', x: 25, y: 35 }, { id: 'w-2', x: 45, y: 55 },
  { id: 'w-3', x: 65, y: 20 }, { id: 'w-4', x: 75, y: 70 }, { id: 'w-5', x: 30, y: 80 },
  { id: 'w-6', x: 50, y: 40 }, { id: 'w-7', x: 80, y: 30 }, { id: 'w-8', x: 20, y: 60 },
];

export const SKILL_LIST = ['barista', 'food_handler', 'warehouse', 'forklift', 'retail', 'nursing', 'phlebotomy', 'admin'];

export const MOCK_HEATMAP = [
  { region: 'Downtown', intensity: 85, trend: '+12%' },
  { region: 'Medical District', intensity: 92, trend: '+24%' },
  { region: 'North Suburbs', intensity: 45, trend: '-5%' },
];
