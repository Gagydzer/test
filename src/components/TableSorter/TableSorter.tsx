import React from 'react';
import PropTypes from 'prop-types';
import './TableSorter.css';

export type Sort = 'asc'|'desc';

export function TableSorter({ state }: { state?: Sort }) {
  return (
    <div className={['TableSorter', state && `TableSorter-${state}`].filter(Boolean).join(' ')}>
      <div className="TableSorter-careet TableSorter-careetUp">
        <svg viewBox="0 0 1024 1024" focusable="false" data-icon="caret-up" width="1em" height="1em" fill="currentColor" aria-hidden="true">
          <path d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z" />
        </svg>
      </div>
      <div className="TableSorter-careet TableSorter-careetDown">
        <svg viewBox="0 0 1024 1024" focusable="false" data-icon="caret-down" width="1em" height="1em" fill="currentColor" aria-hidden="true">
          <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" />
        </svg>
      </div>
    </div>
  );
}

TableSorter.defaultProps = {
  state: undefined,
};

TableSorter.propTypes = {
  state: PropTypes.oneOf(['asc', 'desc']),
};
