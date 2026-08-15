const fs = require('fs');
let code = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

if (!code.includes("newsPreferences?: string[];")) {
  code = code.replace(
    "export interface UserTrackerData {",
    `import { NewsArticle, JobApplication, JobPreferences, Trip, TripExpense, TransitRoute, Subscription, TechAsset, VehicleCost } from '../types';

export interface UserTrackerData {
  newsPreferences?: string[];
  savedArticles?: NewsArticle[];
  jobPreferences?: JobPreferences;
  jobApplications?: JobApplication[];
  trips?: Trip[];
  tripExpenses?: TripExpense[];
  transitRoutes?: TransitRoute[];
  subscriptions?: Subscription[];
  techAssets?: TechAsset[];
  vehicleCosts?: VehicleCost[];`
  );

  code = code.replace(
    "const DEFAULT_DATA: UserTrackerData = {",
    `const DEFAULT_DATA: UserTrackerData = {
  newsPreferences: [],
  savedArticles: [],
  jobPreferences: { categories: [], locations: [], salaryRange: '', currency: '£', experienceLevel: '' },
  jobApplications: [],
  trips: [],
  tripExpenses: [],
  transitRoutes: [],
  subscriptions: [],
  techAssets: [],
  vehicleCosts: [],`
  );
  
  // also need to merge these fields in the onSnapshot logic if we want them preserved, but since the component just uses fbData || DEFAULT_DATA, we're good.
  const fields = ['newsPreferences', 'savedArticles', 'jobPreferences', 'jobApplications', 'trips', 'tripExpenses', 'transitRoutes', 'subscriptions', 'techAssets', 'vehicleCosts'];
  
  let mapFields = fields.map(f => `              ${f}: fbData.${f} || DEFAULT_DATA.${f},`).join('\\n');
  code = code.replace(
    "extraItems: fbData.extraItems || DEFAULT_DATA.extraItems,",
    `extraItems: fbData.extraItems || DEFAULT_DATA.extraItems,\n${mapFields}`
  );
  
  fs.writeFileSync('src/hooks/useFirestoreData.ts', code);
}
