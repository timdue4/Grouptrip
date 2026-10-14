export interface City {
      id: string;
        name: string;
          state: string; // Bundesland-Kürzel (für Feiertage)
            lat: number;
              lng: number;
                airports: string[]; // IATA-Codes, nächster zuerst
                }

                export const AIRPORTS: Record<string, string> = {
                  BER: 'Berlin Brandenburg',
                    HAM: 'Hamburg',
                      MUC: 'München',
                        CGN: 'Köln/Bonn',
                          DUS: 'Düsseldorf',
                            FRA: 'Frankfurt',
                              STR: 'Stuttgart',
                                LEJ: 'Leipzig/Halle',
                                  DRS: 'Dresden',
                                    HAJ: 'Hannover',
                                      NUE: 'Nürnberg',
                                        BRE: 'Bremen',
                                          DTM: 'Dortmund',
                                            FMO: 'Münster/Osnabrück',
                                              FKB: 'Karlsruhe/Baden-Baden',
                                                BSL: 'Basel-Mulhouse-Freiburg',
                                                  RLG: 'Rostock-Laage',
                                                    SCN: 'Saarbrücken',
                                                      ERF: 'Erfurt-Weimar',
                                                        PAD: 'Paderborn/Lippstadt',
                                                        };

                                                        export const CITIES: City[] = [
                                                          { id: 'berlin', name: 'Berlin', state: 'BE', lat: 52.52, lng: 13.405, airports: ['BER'] },
                                                            { id: 'hamburg', name: 'Hamburg', state: 'HH', lat: 53.551, lng: 9.994, airports: ['HAM'] },
                                                              { id: 'muenchen', name: 'München', state: 'BY', lat: 48.137, lng: 11.575, airports: ['MUC'] },
                                                                { id: 'koeln', name: 'Köln', state: 'NW', lat: 50.938, lng: 6.96, airports: ['CGN', 'DUS'] },
                                                                  { id: 'frankfurt', name: 'Frankfurt am Main', state: 'HE', lat: 50.11, lng: 8.682, airports: ['FRA'] },
                                                                    { id: 'stuttgart', name: 'Stuttgart', state: 'BW', lat: 48.775, lng: 9.182, airports: ['STR'] },
                                                                      { id: 'duesseldorf', name: 'Düsseldorf', state: 'NW', lat: 51.228, lng: 6.774, airports: ['DUS', 'CGN'] },
                                                                        { id: 'leipzig', name: 'Leipzig', state: 'SN', lat: 51.34, lng: 12.375, airports: ['LEJ', 'DRS'] },
                                                                          { id: 'dresden', name: 'Dresden', state: 'SN', lat: 51.05, lng: 13.738, airports: ['DRS', 'LEJ'] },
                                                                            { id: 'hannover', name: 'Hannover', state: 'NI', lat: 52.375, lng: 9.732, airports: ['HAJ'] },
                                                                              { id: 'nuernberg', name: 'Nürnberg', state: 'BY', lat: 49.452, lng: 11.077, airports: ['NUE', 'MUC'] },
                                                                                { id: 'bremen', name: 'Bremen', state: 'HB', lat: 53.079, lng: 8.802, airports: ['BRE', 'HAM'] },
                                                                                  { id: 'dortmund', name: 'Dortmund', state: 'NW', lat: 51.514, lng: 7.466, airports: ['DTM', 'DUS'] },
                                                                                    { id: 'essen', name: 'Essen', state: 'NW', lat: 51.455, lng: 7.012, airports: ['DUS', 'DTM'] },
                                                                                      { id: 'muenster', name: 'Münster', state: 'NW', lat: 51.961, lng: 7.629, airports: ['FMO', 'DTM'] },
                                                                                        { id: 'bielefeld', name: 'Bielefeld', state: 'NW', lat: 52.021, lng: 8.533, airports: ['PAD', 'HAJ'] },
                                                                                          { id: 'karlsruhe', name: 'Karlsruhe', state: 'BW', lat: 49.007, lng: 8.404, airports: ['FKB', 'STR'] },
                                                                                            { id: 'freiburg', name: 'Freiburg', state: 'BW', lat: 47.999, lng: 7.842, airports: ['BSL', 'FKB'] },
                                                                                              { id: 'mannheim', name: 'Mannheim', state: 'BW', lat: 49.487, lng: 8.466, airports: ['FRA', 'STR'] },
                                                                                                { id: 'mainz', name: 'Mainz', state: 'RP', lat: 50.0, lng: 8.271, airports: ['FRA'] },
                                                                                                  { id: 'saarbruecken', name: 'Saarbrücken', state: 'SL', lat: 49.24, lng: 6.997, airports: ['SCN', 'FRA'] },
                                                                                                    { id: 'kiel', name: 'Kiel', state: 'SH', lat: 54.323, lng: 10.123, airports: ['HAM'] },
                                                                                                      { id: 'rostock', name: 'Rostock', state: 'MV', lat: 54.092, lng: 12.099, airports: ['RLG', 'HAM'] },
                                                                                                        { id: 'erfurt', name: 'Erfurt', state: 'TH', lat: 50.978, lng: 11.029, airports: ['ERF', 'LEJ'] },
                                                                                                          { id: 'magdeburg', name: 'Magdeburg', state: 'ST', lat: 52.121, lng: 11.628, airports: ['LEJ', 'HAJ'] },
                                                                                                            { id: 'augsburg', name: 'Augsburg', state: 'BY', lat: 48.371, lng: 10.898, airports: ['MUC'] },
                                                                                                              { id: 'potsdam', name: 'Potsdam', state: 'BB', lat: 52.396, lng: 13.058, airports: ['BER'] },
                                                                                                              ].sort((a, b) => a.name.localeCompare(b.name, 'de'));

                                                                                                              export function cityById(id: string): City | undefined {
                                                                                                                return CITIES.find((c) => c.id === id);
                                                                                                                }

                                                                                                                export function airportLabel(code: string): string {
                                                                                                                  return `${AIRPORTS[code] ?? code} (${code})`;
                                                                                                                  }
}