const fs = require('fs');

let code = fs.readFileSync('src/components/TravelTripsTab.tsx', 'utf8');

code = code.replace(
  "import { Calendar, MapPin, CreditCard, Receipt, Split, Train, Bus, Upload, X, Plus, Users, Landmark } from 'lucide-react';",
  "import { Calendar, MapPin, CreditCard, Receipt, Split, Train, Bus, Upload, X, Plus, Users, Landmark } from 'lucide-react';\nimport { AddToCalendar } from './AddToCalendar';"
);

code = code.replace(
  "<h3 className=\"text-xl font-bold\">{trip.destination}</h3>",
  "<div className=\"flex items-center justify-between\">\n                        <h3 className=\"text-xl font-bold\">{trip.destination}</h3>\n                        <AddToCalendar title={`Trip to ${trip.destination}`} startDate={`${trip.startDate}T00:00:00`} endDate={`${trip.endDate}T23:59:59`} />\n                      </div>"
);

fs.writeFileSync('src/components/TravelTripsTab.tsx', code);
