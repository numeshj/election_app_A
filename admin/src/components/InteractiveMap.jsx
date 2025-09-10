import React, { useMemo } from 'react';
import { getPartyColor } from '../utils/colors';
import { sriLankaPaths, normalizeName, aliasName } from '../utils/mapPaths';
import './InteractiveMap.css';

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
    <div className={large ? 'MapComp-shell large' : 'MapComp-shell'}>
      <svg
        viewBox="0 0 1000 1000"
        className="MapComp-svg"
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
                  className="MapComp-district outline"
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
                className="MapComp-district has-data"
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
    <div className="MapComp-legend">
      <span className="MapComp-legendItem">
        <span className="MapComp-legendSwatch none" /> No Data
      </span>
      <span className="MapComp-legendItem">
        <span className="MapComp-legendSwatch partial" /> Partial
      </span>
      <span className="MapComp-legendItem">
        <span className="MapComp-legendSwatch full" /> Complete
      </span>
    </div>
  );
}
