import React, { useMemo } from 'react';
import { getPartyColor } from '../utils/colors';
import { sriLankaPaths, normalizeName, aliasName } from '../utils/mapPaths';

export function InteractiveMap({ winners, onSelect, large }) {
  // Create a lookup map for winners by normalized district name
  const winnersByName = useMemo(() => {
    return Object.fromEntries(
      winners.map(w => [normalizeName(w.ed_name), w])
    );
  }, [winners]);

  // Get the Sri Lanka map paths
  const mapPaths = useMemo(() => sriLankaPaths(), []);

  return (
    <div className={large ? 'map-shell large' : 'map-shell'}>
      <svg
        viewBox="0 0 1000 1000"
        className="map-svg"
        data-large={large ? '1' : '0'}
      >
        <g>
          {mapPaths.map(path => {
            const districtKey = normalizeName(aliasName(path.name));
            const winner = winnersByName[districtKey];

            // If no winner data, show outline only
            if (!winner) {
              return (
                <path
                  key={path.name}
                  d={path.d}
                  className="map-district outline"
                />
              );
            }

            // Calculate fill color and opacity
            const fillColor = getPartyColor(winner.party_code);
            const opacity = winner.complete
              ? 1
              : (0.55 + 0.45 * winner.ratio);

            // Create tooltip text
            const tooltipText = `${path.name} - ${winner.party_code} (${Math.round(winner.ratio * 100)}% divisions)`;

            return (
              <path
                key={path.name}
                d={path.d}
                fill={fillColor}
                fillOpacity={opacity}
                className="map-district has-data"
                onClick={() => onSelect && onSelect(winner)}
              >
                <title>{tooltipText}</title>
              </path>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend">
      <span className="legend-item">
        <span className="legend-swatch none" /> No Data
      </span>
      <span className="legend-item">
        <span className="legend-swatch partial" /> Partial
      </span>
      <span className="legend-item">
        <span className="legend-swatch full" /> Complete
      </span>
    </div>
  );
}
