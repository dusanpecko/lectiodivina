'use client';

import { calculateShipping, getAllShippingZones } from '@/lib/shipping';
import { Calculator, Package, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function ShippingCalculatorPage() {
  const [country, setCountry] = useState('SK');
  const [orderValue, setOrderValue] = useState<number>(25);
  
  const zones = getAllShippingZones();
  const calculation = calculateShipping(country, orderValue);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          Kalkulačka poštovného
        </h1>
        <p className="text-gray-600 mt-2">
          Vypočítajte poštovné pre konkrétnu objednávku a krajinu
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Výpočet poštovného
          </h2>

          {/* Country Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Krajina doručenia
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Slovensko a Česko">
                <option value="SK">🇸🇰 Slovensko</option>
                <option value="CZ">🇨🇿 Česko</option>
              </optgroup>
              
              <optgroup label="Stredná Európa">
                <option value="AT">🇦🇹 Rakúsko</option>
                <option value="HU">🇭🇺 Maďarsko</option>
                <option value="PL">🇵🇱 Poľsko</option>
                <option value="DE">🇩🇪 Nemecko</option>
              </optgroup>
              
              <optgroup label="Západná a Južná Európa">
                <option value="FR">🇫🇷 Francúzsko</option>
                <option value="IT">🇮🇹 Taliansko</option>
                <option value="ES">🇪🇸 Španielsko</option>
                <option value="NL">🇳🇱 Holandsko</option>
                <option value="BE">🇧🇪 Belgicko</option>
                <option value="GB">🇬🇧 Veľká Británia</option>
                <option value="IE">🇮🇪 Írsko</option>
                <option value="PT">🇵🇹 Portugalsko</option>
              </optgroup>
              
              <optgroup label="Východná Európa a Balkán">
                <option value="RO">🇷🇴 Rumunsko</option>
                <option value="BG">🇧🇬 Bulharsko</option>
                <option value="HR">🇭🇷 Chorvátsko</option>
                <option value="SI">🇸🇮 Slovinsko</option>
                <option value="RS">🇷🇸 Srbsko</option>
                <option value="UA">🇺🇦 Ukrajina</option>
              </optgroup>
              
              <optgroup label="Severná Európa">
                <option value="SE">🇸🇪 Švédsko</option>
                <option value="NO">🇳🇴 Nórsko</option>
                <option value="DK">🇩🇰 Dánsko</option>
                <option value="FI">🇫🇮 Fínsko</option>
              </optgroup>
              
              <optgroup label="USA a Kanada">
                <option value="US">🇺🇸 USA</option>
                <option value="CA">🇨🇦 Kanada</option>
              </optgroup>
              
              <optgroup label="Ázijsko-Pacifický región">
                <option value="AU">🇦🇺 Austrália</option>
                <option value="NZ">🇳🇿 Nový Zéland</option>
                <option value="JP">🇯🇵 Japonsko</option>
                <option value="KR">🇰🇷 Južná Kórea</option>
                <option value="SG">🇸🇬 Singapur</option>
              </optgroup>
            </select>
          </div>

          {/* Order Value Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hodnota objednávky (bez poštovného)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={orderValue}
                onChange={(e) => setOrderValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                €
              </span>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Dopravná zóna:</span>
              <span className="font-semibold">{calculation.zone.name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Doba doručenia:</span>
              <span className="font-semibold">{calculation.zone.delivery_days} dní</span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Hodnota tovaru:</span>
                <span className="font-semibold">€{orderValue.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700">Poštovné:</span>
                <span className={`font-bold text-lg ${calculation.isFree ? 'text-green-600' : 'text-blue-600'}`}>
                  {calculation.isFree ? (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      ZDARMA
                    </span>
                  ) : (
                    `€${calculation.cost.toFixed(2)}`
                  )}
                </span>
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Celkom:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    €{(orderValue + calculation.cost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Shipping Progress */}
            {!calculation.isFree && calculation.amountUntilFree > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Tip:</span> Pridajte ešte{' '}
                  <span className="font-bold">€{calculation.amountUntilFree.toFixed(2)}</span>{' '}
                  do košíka a získate <span className="font-bold">dopravu ZDARMA</span>!
                </p>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(orderValue / calculation.zone.free_threshold) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {((orderValue / calculation.zone.free_threshold) * 100).toFixed(0)}% 
                  {' '}z €{calculation.zone.free_threshold} pre dopravu zdarma
                </p>
              </div>
            )}

            {calculation.isFree && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">
                    Gratulujeme! Máte nárok na dopravu ZDARMA 🎉
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Zones Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Prehľad dopravných zón</h2>
          
          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`border rounded-lg p-4 ${
                  calculation.zone.name === zone.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <span className="text-lg font-bold text-blue-600">
                    €{zone.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Doprava zdarma:</span> nad €{zone.free_threshold}
                  </p>
                  <p>
                    <span className="font-medium">Doba doručenia:</span> {zone.delivery_days} dní
                  </p>
                  {zone.countries.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {zone.countries.slice(0, 10).join(', ')}
                      {zone.countries.length > 10 && ` +${zone.countries.length - 10} ďalších`}
                    </p>
                  )}
                  {zone.countries.length === 0 && (
                    <p className="text-xs text-gray-500 italic mt-2">
                      Všetky ostatné krajiny
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
