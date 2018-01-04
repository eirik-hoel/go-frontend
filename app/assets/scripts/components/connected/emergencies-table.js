'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';

import { environment } from '../../config';
import { getEmergenciesList } from '../../actions';
import { nope, commaSeparatedNumber as n } from '../../utils/format';
import { get } from '../../utils/utils';
import { disasterType } from '../../utils/field-report-constants';

import Fold from '../fold';
import BlockLoading from '../block-loading';
import DisplayTable, { SortHeader, FilterHeader } from '../display-table';
import { SFPComponent } from '../../utils/extendables';

const dTypeOptions = [
  { value: 'all', label: 'All Types' },
  // Exclude the first item since it's a dropdown placeholder
  ...disasterType.slice(1)
];

class EmergenciesTable extends SFPComponent {
  constructor (props) {
    super(props);
    this.state = {
      emerg: {
        page: 1,
        sort: {
          field: '',
          direction: 'asc'
        },
        filters: {
          // date: 'all',
          dtype: 'all'
        }
      }
    };
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  componentDidMount () {
    this.requestResults();
  }

  requestResults () {
    let qs = {};
    let state = this.state.emerg;
    if (state.sort.field) {
      qs.order_by = (state.sort.direction === 'desc' ? '-' : '') + state.sort.field;
    }

    if (state.filters.dtype !== 'all') {
      qs.dtype = state.filters.dtype;
    }

    this.props._getEmergenciesList(this.state.emerg.page, qs);
  }

  updateData (what) {
    this.requestResults();
  }

  render () {
    const {
      data,
      fetching,
      fetched,
      error
    } = this.props.list;

    if (fetching) {
      return (
        <Fold title='Latest Emergencies'>
          <BlockLoading/>
        </Fold>
      );
    }

    if (error) {
      return (
        <Fold title='Latest Emergencies'>
          <p>Oh no! An error ocurred getting the stats.</p>
        </Fold>
      );
    }

    if (fetched) {
      const headings = [
        {
          id: 'date',
          label: 'Date'
          // label: <FilterHeader id='date' title='Date' options={dateOptions} filter={this.state.emerg.filters.date} onSelect={this.handleFilterChange.bind(this, 'emerg', 'date')} />
        },
        { id: 'name', label: 'Name' },
        {
          id: 'dtype',
          label: <FilterHeader id='dtype' title='Disaster Type' options={dTypeOptions} filter={this.state.emerg.filters.dtype} onSelect={this.handleFilterChange.bind(this, 'emerg', 'dtype')} />
        },
        {
          id: 'totalAffected',
          label: <SortHeader id='num_affected' title='Requested Amount (CHF)' sort={this.state.emerg.sort} onClick={this.handleSortChange.bind(this, 'emerg', 'num_affected')} />
        },
        {
          id: 'beneficiaries',
          label: 'Beneficiaries'
        },
        { id: 'countries', label: 'Countries' }
      ];

      const rows = data.objects.map(rowData => {
        const disasterDate = rowData.disaster_start_date ||
          rowData.start_date ||
          rowData.created_at;

        const date = disasterDate
          ? DateTime.fromISO(disasterDate).toISODate() : nope;

        const beneficiaries = get(rowData, 'appeals', []).reduce((acc, next) => {
          return acc + next.num_beneficiaries;
        }, 0);

        const countries = get(rowData, 'countries', []).map(c => (
          <Link className='link--primary' key={`c.iso`} to={`/country/${c.id}`}>{c.name}</Link>
        ));

        return {
          id: rowData.id,
          date: date,
          name: <Link className='link--primary' to={`/emergencies/${rowData.id}`}>{get(rowData, 'name', nope)}</Link>,
          dtype: get(rowData, 'dtype.name', nope),
          totalAffected: n(get(rowData, 'num_affected')),
          beneficiaries: n(beneficiaries),
          countries: countries.length ? countries : nope
        };
      });

      return (
        <Fold title={`Latest Emergencies (${n(data.meta.total_count)})`}>
          <DisplayTable
            headings={headings}
            rows={rows}
            pageCount={data.meta.total_count / data.meta.limit}
            page={data.meta.offset / data.meta.limit}
            onPageChange={this.handlePageChange.bind(this, 'emerg')}
          />
        </Fold>
      );
    }

    return null;
  }
}

if (environment !== 'production') {
  EmergenciesTable.propTypes = {
    _getEmergenciesList: T.func,
    list: T.object
  };
}

// /////////////////////////////////////////////////////////////////// //
// Connect functions

const selector = (state) => ({
  list: state.emergencies.list
});

const dispatcher = (dispatch) => ({
  _getEmergenciesList: (...args) => dispatch(getEmergenciesList(...args))
});

export default connect(selector, dispatcher)(EmergenciesTable);
